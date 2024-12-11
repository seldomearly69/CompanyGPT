# Import dependencies

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import chromadb
from flask_sqlalchemy import SQLAlchemy
import hashlib
from sqlalchemy.sql import text
from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain_chroma import Chroma

# Set debug mode

debug = False

# Import utility functions

from utils import *

# Retrieve environment variables

POSTGRES_USER=os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD=os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB=os.getenv("POSTGRES_DB")
CHROMA_DB_HOST = os.getenv("CHROMA_DB_HOST", "localhost")
CHROMA_DB_PORT = os.getenv("CHROMA_DB_PORT", "8000")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.1")

# Initialise flask app and connection with postgres DB

app = Flask(__name__)
cors = CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@pgdb:5432/{POSTGRES_DB}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)



# Set up embeddings model for Ollama

oembed = OllamaEmbeddings(model=EMBEDDING_MODEL, base_url="http://host.docker.internal:11434",show_progress=True)

# Establish connection with chroma db

client = chromadb.HttpClient(host=CHROMA_DB_HOST, port=CHROMA_DB_PORT)
collection = client.get_collection('embeddings')
vectorstore = Chroma(client=client, embedding_function=oembed)

# Configure system prompt

system_prompt = """
    You are an expert on the documents provided in your context. These documents are SOPs for a company. 
    Your job is to help users, who are adults but complete beginners when it comes to the contents of the documents, 
    answer questions related to these documents. You are to answer entirely based on these documents and never based 
    on your prior knowledge of other real-world cases. You are to take into account every part of the documents before 
    generating an answer. Organise your answers well and readably. Be succinct and to the point. Do not repeat semantics.
    Include all possible and relevant details.
    """

# Load the LLM model

llm = Ollama(model=LLM_MODEL, num_ctx=2000, system=system_prompt, num_predict=-1, temperature=0, top_p=0.3, base_url="http://host.docker.internal:11434")

# Endpoint to embed documents

@app.route('/embed', methods=['POST'])
def embed_documents():
    try:
        
        # Retrieve files from request

        files = request.files.getlist('files')
        print(files)

        # Load files

        try:
            docs = load_docs(files)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        
        # Split documents into chunks

        all_splits = sentence_chunk_splitter(docs)
        print("Number of splits: ", len(all_splits))

        # Embed chunks and store in chromadb

        Chroma.from_documents(documents=all_splits, embedding=oembed,client=client, collection_name='embeddings')

        return jsonify({"message": "file upload successful"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to submit a query and generate a response

@app.route('/query', methods=['POST'])
def invoke_llm():

    # Embed the query

    data = request.get_json()
    question = data["question"]
    query_embedding = oembed.embed_query(question)
    
    print(len(query_embedding))
    print(collection.metadata)
    print(dir(collection.metadata))

    # Perform a similarity search on the Chroma DB collection using the query embedding
    # Retrieve top 20 documents

    retrieved_docs = collection.query(query_embeddings=[query_embedding], n_results=100)
    initial_docs = [doc.split("search_document: ")[1] for doc in retrieved_docs["documents"][0]]

    # Rerank the top 20 retrieved documents and select the top 5

    reranked_docs = rerank_documents(question, initial_docs, top_k=5)
    print(f"Reranked Top 5 Context: {reranked_docs}")

    # Prepare the final prompt for the LLM with reranked documents as context

    context = "\n\n".join(reranked_docs)
    prompt = f"""
    
    Context: {context}

    Question: {question}

    """

    answer = ""

    # Generate the answer using the LLM model

    answer = llm.invoke(prompt)
    
    return jsonify({"Answer": answer}), 200

# Endpoint to retrieve all embedded documents

@app.route('/embeddings')
def get_documents():

    # Get all documents in the collection

    stored_documents = collection.get(ids=None)
    for doc_id, doc, metadata in zip(stored_documents['ids'], stored_documents['documents'], stored_documents['metadatas']):
        # Insert debug code
        pass

    print("Number of docs: ", str(len(stored_documents['documents'])))

    
    return jsonify({
        "message": "success",
        "documents": list(set([(m['filename'],m['uploadDate']) for m in stored_documents['metadatas']]))
    }), 200

# Endpoint to clear chroma db. Not used by end users. For development purposes.

@app.route('/clear', methods=['DELETE'])
def clear_db():
    stored_documents = collection.get(ids=None)
    collection.delete(ids=[doc_id for doc_id, doc in zip(stored_documents['ids'], stored_documents['documents'])])
    return jsonify({"message": "success"}), 200

# Endpoint to delete one document from chroma db. Used by end users.

@app.route('/remove/<filename>', methods=['DELETE'])
def remove_doc(filename):
    stored_documents = collection.get(where={"filename": filename})
    collection.delete(ids=[doc_id for doc_id, doc in zip(stored_documents['ids'], stored_documents['documents'])])
    return jsonify({"message": "success"}), 200

# Authentication endpoint

@app.route('/login', methods=['POST'])
def auth():
    data = request.get_json()

    # Hash the provided password

    hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
    print(data)

    # Query to fetch the user

    query = text("SELECT * FROM users WHERE email = :email AND password_hash = :hashed_password")
    result = db.engine.execute(query, {"email": data['email'], "hashed_password": hashed_password})

    # Fetch the user

    user = result.fetchone()  # Fetch a single row
    print(user)

    if user:
        return jsonify({"name": user['username'], "email": user['email'], "role": user['role']}), 200
    else:
        return jsonify({"Error": "Invalid credentials"}), 403
    
# Endpoint for dummy response querying. Used in development only to avoid long response generation time.

@app.route('/query_dummy', methods=['POST'])
def dummy():
    return jsonify({"Answer": """
        For a trip to be considered a transfer, all the following conditions must be true:

            1. The current service qualifies for through fares. You can check which services are eligible in the 'Service' column of Table A 2.
            2. There can be a maximum of 5 transfers per journey (this number can be configured). If you make 5 transfers prior to your current trip, this trip will be considered the start of a new journey.
            3. The time between entering the current trip and completing the previous one must not exceed 45 minutes. If your last trip was a bus trip and you didn't tap out, the allowable transfer time is 120 minutes from the point of boarding the previous bus.
            4. The current bus service number must not be the same as any of the preceding bus services taken in the journey.
            5. MRT and LRT services are considered rail services. If your transfer occurs at a station where transferring requires exiting the paid area, virtual links would have to apply.
            6. The time of entering the current trip does not exceed 120 minutes from the first entry or boarding of the same journey.
            7. Your current trip does not fall into any exception conditions detailed in Section 2.10 on Exceptions To Through Fares.
            8. The same card is used for all trips in the journey.
            9. If you are transferring between rail services, the station where you exit and the one where you enter your next trip must not have the same name; a transfer with the same station name at the exit and entry points is not eligible. This rule applies to both consecutive rail-rail scenarios and non-consecutive rail-bus-rail scenarios.
    
        Is there anything else I can help clarify for you?
                    """}), 200

# Endpoint to check postgres DB connection. Development use only.

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Perform a lightweight query to verify the connection
        result = db.engine.execute("SELECT 1").scalar()
        if result == 1:
            return jsonify({"status": "success", "message": "Database connection is active"}), 200
        else:
            return jsonify({"status": "failure", "message": "Unexpected result from database"}), 500
    except Exception as e:
        return jsonify({"status": "failure", "message": str(e)}), 500

# Endpoint to start and store new chat

@app.route('/new_chat', methods=['POST'])
def create_chat():
    try:
        data = request.get_json()
        print(data)

        # Use a raw SQL query with bound parameters

        query = text("""
            INSERT INTO chats (title, user_email, messages)
            VALUES (:title, :user_email, :messages)
            RETURNING chat_id
        """)

        # Execute the query with bound parameters

        result = db.engine.execute(query, {
            "title": data['question'][:50],
            "user_email": data['email'],
            "messages": [data['question']]
        })

        inserted_id = result.fetchone()[0]

        if inserted_id:
            return jsonify({"message": "Insert successful", "chatId": inserted_id}), 201
        else:
            return jsonify({"error": "Insert failed"}), 400
    except Exception as e:
        return jsonify({"error": str(e)})

# Endpoint to retrieve chats belonging to a user. Only returns titles of chats.

@app.route('/recent_chats', methods=['POST'])
def recent_chats():
    data = request.get_json()
    print(data)

    # Use a raw SQL query with bound parameters

    query = text("""
        SELECT * FROM chats WHERE user_email = :user_email
    """)

    # Execute the query with bound parameters

    results = db.engine.execute(query, {
        "user_email" : data['email']
    }).fetchall()

    chats = [dict(row) for row in results]

    return jsonify({"chats": chats}), 200

# Endpoint to retrieve actual chat details for a particular chat id

@app.route('/chat_history/<chat_id>')
def get_chat_history(chat_id):
    query = text("""
        SELECT * FROM chats WHERE chat_id = :chat_id
    """)

    # Execute the query with bound parameters

    result = db.engine.execute(query, {
        "chat_id" : chat_id
    }).fetchone()

    return jsonify({"messages": dict(result)['messages']}), 200

# Update chat details for a particular chat id

@app.route('/chat_history/<chat_id>', methods=['PUT'])
def update_chat_history(chat_id):
    data = request.get_json()
    print(chat_id)
    query = text("""
        UPDATE chats
        SET messages = messages || :msg
        WHERE chat_id = :chat_id
        RETURNING chat_id;
    """)

    # Execute the query with bound parameters
    
    result = db.engine.execute(query, {
        "msg": data['messages'],
        "chat_id" : chat_id
    }).fetchone()

    return jsonify({"chat_id updated": dict(result)}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)  # Bind to 0.0.0.0 to allow external access
