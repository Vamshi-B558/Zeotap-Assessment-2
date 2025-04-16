# Bidirectional ClickHouse & Flat File Data Ingestion Tool

## Overview
This project provides a web application for bidirectional data transfer between ClickHouse databases and flat files. It includes a backend server and a React frontend.

## Running Locally Without Docker

### Backend
1. Navigate to the backend directory:
   ```
   cd clickhouse-flatfile-ingestion-tool/backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the backend server:
   ```
   npm start
   ```
4. The backend server will run on port 5000 by default.

### Frontend
1. Navigate to the frontend directory:
   ```
   cd clickhouse-flatfile-ingestion-tool/frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend development server:
   ```
   npm start
   ```
4. The frontend will run on port 3000 by default.

## Notes
- The frontend is responsive and uses basic CSS for layout.
- Core features such as JWT authentication, ClickHouse integration, file upload, column selection, and reporting are to be implemented.

## Future Work
- Implement backend APIs for authentication, data ingestion, and reporting.
- Develop frontend components for user interaction and configuration.
- Add testing and deployment scripts.
