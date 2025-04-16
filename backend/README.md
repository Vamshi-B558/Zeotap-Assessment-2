# Bidirectional ClickHouse & Flat File Data Ingestion Tool

## Project Overview

This project is a tool designed to facilitate bidirectional data ingestion between flat files (CSV) and a ClickHouse database. It consists of a backend API service and a frontend React application.

## Backend

- Built with Node.js and Express.
- Uses ClickHouse Node.js client to connect and interact with ClickHouse database.
- Provides endpoints for:
  - Uploading CSV files with selected columns for ingestion into ClickHouse.
  - Fetching ingested data from ClickHouse.
- Implements JWT-based authentication for secure API access.
- Uses Multer middleware for handling file uploads.
- Parses CSV files and inserts data into a ClickHouse table with a predefined schema.
- Runs on port 5002 by default.

## Frontend

- Built with React.
- Allows users to:
  - Enter JWT token for authentication.
  - Select and upload CSV files.
  - Select columns from the CSV to ingest.
  - View ingested data retrieved from the backend.
- Communicates with backend API on port 5002.
- Provides a user-friendly interface for data ingestion and visualization.

## Development Details

- The backend creates the ClickHouse table `ingestion_table` if it does not exist, with columns: `id` (UInt32), `name` (String), `value` (Float64), and `timestamp` (DateTime).
- The frontend reads the first line of the CSV file to extract column names for user selection.
- JWT tokens are generated using a shared secret key (`your_jwt_secret_key`) and must be provided to access the API.
- The backend expects the CSV columns to match the table schema for successful ingestion.
- The ingestion process batches insertions for performance.
- The frontend fetches and displays up to 100 rows of ingested data.

## How to Run

### Backend

1. Ensure ClickHouse server is running and accessible on `http://localhost:8123`.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the backend server:
   ```
   node server.js
   ```
4. The backend listens on port 5002.

### Frontend

1. Navigate to the frontend directory:
   ```
   cd ../frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend development server:
   ```
   npm start
   ```
4. The frontend will run on a port (default 3000 or alternative if 3000 is busy).

## Generating JWT Token

Use the provided `generate_jwt.js` script to generate a JWT token for authentication:

```
node generate_jwt.js
```

Use the generated token in the frontend to authenticate API requests.

## Notes

- Ensure the CSV file columns and data types match the ClickHouse table schema.
- Monitor backend logs for ingestion and query errors.
- The project uses basic JWT authentication; consider enhancing security for production use.


