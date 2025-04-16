const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5002;

// Logging middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(bodyParser.json());

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    console.error('Authorization header missing');
    res.sendStatus(401);
  }
};

// Basic route to check server status
app.get('/', (req, res) => {
  res.send('ClickHouse Flat File Ingestion Backend is running');
});

// File upload and ingestion setup
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const fs = require('fs');
const csv = require('csv-parser');
const { ClickHouse } = require('clickhouse');

const clickhouse = new ClickHouse({
  url: 'http://localhost',
  port: 8123,
  debug: false,
  basicAuth: {
    username: 'insa252',
    password: '18562-Ee-201',
  },
  isUseGzip: false,
  format: "json", // "json" or "csv"
  config: {
    session_timeout: 60,
    output_format_json_quote_64bit_integers: 0,
    enable_http_compression: 0,
  },
});

  // Create ingestion_table if not exists with a sample schema
const createTableQuery = `
CREATE TABLE IF NOT EXISTS ingestion_table (
  id UInt32,
  name String,
  value Float64,
  timestamp DateTime
) ENGINE = MergeTree()
ORDER BY id
`;

clickhouse.query(createTableQuery).toPromise()
  .then(() => {
    console.log('ingestion_table is ready');
  })
  .catch((err) => {
    console.error('Error creating ingestion_table:', err);
  });

app.post('/upload', authenticateJWT, upload.single('file'), (req, res) => {
  console.log('Authorization header:', req.headers.authorization);
  console.log('Raw req.body.columns:', req.body.columns);

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let selectedColumns;
  try {
    selectedColumns = JSON.parse(req.body.columns);
    console.log('Parsed selectedColumns:', selectedColumns);
  } catch (err) {
    console.error('Error parsing columns:', err);
    return res.status(400).json({ error: 'Invalid columns format' });
  }

  if (!selectedColumns || !Array.isArray(selectedColumns) || selectedColumns.length === 0) {
    return res.status(400).json({ error: 'No columns selected for ingestion' });
  }

  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      // Filter data to only selected columns
      const filteredData = {};
      selectedColumns.forEach(col => {
        if (data.hasOwnProperty(col)) {
          filteredData[col] = data[col];
        }
      });
      results.push(filteredData);
    })
    .on('end', async () => {
      try {
        // Insert filtered rows into ClickHouse
        await clickhouse.insert('INSERT INTO ingestion_table (id, name, value, timestamp)', results).toPromise();

        fs.unlinkSync(filePath);

        res.json({ message: `File '${req.file.originalname}' uploaded and ingested successfully.`, ingestedRecords: results.length });
      } catch (error) {
        console.error('Error ingesting data:', error.stack || error.message || error);
        res.status(500).json({ error: 'Failed to ingest data into ClickHouse' });
      }
    });
});

app.get('/data', authenticateJWT, async (req, res) => {
  try {
    const query = 'SELECT * FROM ingestion_table LIMIT 100';
    const rows = await clickhouse.query(query).toPromise();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error.stack || error.message || error);
    res.status(500).json({ error: 'Failed to fetch data from ClickHouse' });
  }
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
