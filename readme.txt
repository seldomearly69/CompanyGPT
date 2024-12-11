Company-GPT Setup Guide

This guide provides step-by-step instructions to set up the Company-GPT application, including dependencies, backend, and frontend configurations.

---

Dependencies
Ensure the following dependencies are installed before proceeding:
1. Docker
2. Docker Compose
3. npm
3. Ollama

---

Backend Setup

1. Navigate to the backend directory:
   cd /CompanyGPT

2. Build and start the containers:
   docker-compose up -d --build

3. Check the running containers:
   docker ps

4. Pull the required models:
   ollama pull <model-name>
   Replace <model-name> with the name of the embedding model and the LLM model

---

Frontend Setup

1. Navigate to the frontend directory:
   cd /CompanyGPT/frontend

2. Install the dependencies:
   npm i

3. Start the development server:
   npm run dev

4. Open the application in your browser:
   http://localhost:3000

---

Environment Variables

Backend Configuration (/CompanyGPT)

Create a .env file in the backend directory and include the following variables:

EMBEDDING_MODEL=            # Name of the embedding model
LLM_MODEL=                  # Name of the LLM model
CHROMA_DB_HOST=             # Host for the ChromaDB (usually the service name in docker-compose.yml)
CHROMA_DB_PORT=             # Port for the ChromaDB
ANONYMIZED_TELEMETRY=false  # Set to false to disable telemetry
PERSIST_DIRECTORY=          # Directory to persist ChromaDB data
POSTGRES_DB=                # PostgreSQL database name
POSTGRES_USER=              # PostgreSQL username
POSTGRES_PASSWORD=          # PostgreSQL password

Frontend Configuration (/CompanyGPT/frontend)

Create a .env file in the frontend directory and include the following variables:

NEXTAUTH_URL=http://localhost:3000       # Base URL for your application
NEXTAUTH_SECRET=                         # Secret key for authentication
AUTH_API_URL=                            # URL for the authentication service
NEXT_PUBLIC_BACKEND_API_URL=             # URL for the backend API

---

Access the Application

- Frontend: http://localhost:3000
- Backend: Configured based on your .env variables.

---

Accounts

- Email: admin@company.com.sg, Password: P@ssw0rd
- Email: test1@company.com.sg, Password: P@ssw0rd
