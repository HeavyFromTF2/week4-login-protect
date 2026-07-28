const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(express.json());

// Swagger Docs
const swaggerDocument = JSON.parse(fs.readFileSync('./src/docs/openapi.json', 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Base endpoints
app.get('/', (req, res) => {    
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// Task Routes
app.use('/tasks', taskRoutes);

module.exports = app;