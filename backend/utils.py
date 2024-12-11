# Import dependencies

from langchain_community.document_loaders import Docx2txtLoader
import io, nltk, tempfile, datetime
from nltk.tokenize import sent_tokenize  # Requires nltk library
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

nltk.download('punkt_tab')

# Initialize reranker model and tokenizer

reranker_model = AutoModelForSequenceClassification.from_pretrained("cross-encoder/ms-marco-MiniLM-L-12-v2")
reranker_tokenizer = AutoTokenizer.from_pretrained("cross-encoder/ms-marco-MiniLM-L-12-v2")

# Define custom split that encapsulates metadata and content

class CustomSplit:
    def __init__(self, page_content, metadata):
        self.page_content = page_content
        self.metadata = metadata

# Splits text into chunks

def sentence_chunk_splitter(documents, chunk_size=1200):
    chunks = []
    current_chunk = ""
    for doc in documents:
        print(doc['metadata'])

        # Tokenize content of document
        sentences = sent_tokenize(doc['page_content'].page_content)

        for sentence in sentences:
            current_chunk += " " + sentence

            # If adding another sentence exceeds chunk size, save the chunk and start a new one
            if len(current_chunk) > chunk_size:
                chunks.append(CustomSplit("search_document: " + current_chunk.strip(),doc['metadata']))
                current_chunk = sentence
                
    # Add any remaining content in the current chunk
    if current_chunk:
        chunks.append(CustomSplit("search_document: " + current_chunk.strip(),doc['metadata']))
    return chunks

# Process files into text format

def load_docs(files):
    docs = []
    date = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    for file in files:
        
        file_type = file.filename.split('.')[-1].lower()
        if file_type == 'docx':
            # Read the file into a BytesIO object
            file_stream = io.BytesIO(file.read())
            # Create a temporary file to save the in-memory content, auto-deleting after use
            with tempfile.NamedTemporaryFile(suffix=".docx", delete=True) as temp_file:
                temp_file.write(file_stream.getbuffer())
                temp_file.flush()  # Ensure all data is written to disk

                # Initialize the loader with the temporary file path within the with block
                loader = Docx2txtLoader(file_path=temp_file.name)
                pages = loader.load()
                for page in pages:
                    docs.append({
                        "page_content": page,  # Original page content
                        "metadata": {"filename": file.filename, "uploadDate": date},
                    })

        else:
            raise Exception(f"Unsupported file type: {file.filename}")
    return docs

# Reranks chunks based on query

def rerank_documents(query, documents, top_k=5):
    scores = []
    for doc in documents:
        inputs = reranker_tokenizer(query, doc, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            score = reranker_model(**inputs).logits[0].item()
        scores.append(score)
    
    # Sort documents by scores in descending order and select top_k
    reranked_docs = [doc for _, doc in sorted(zip(scores, documents), key=lambda x: x[0], reverse=True)[:top_k]]
    return reranked_docs