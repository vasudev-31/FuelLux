import express from 'express';

const app = express();
app.use(express.json());

// In-memory data store (resets on Vercel cold starts)
let stock = [
  { id: 'petrol', type: 'Petrol', available: 12500, capacity: 15000, price: 102.45, lastUpdated: new Date().toISOString() },
  { id: 'diesel', type: 'Diesel', available: 4200, capacity: 15000, price: 94.12, lastUpdated: new Date().toISOString() },
];

let emergencyRequests: any[] = [];

// --- API Routes ---

app.get('/api/stock', (req, res) => {
  res.json(stock);
});

app.post('/api/stock', (req, res) => {
  const { type, available, price } = req.body;
  const item = stock.find(s => s.type.toLowerCase() === type.toLowerCase());
  if (item) {
    if (available !== undefined) item.available = available;
    if (price !== undefined) item.price = price;
    item.lastUpdated = new Date().toISOString();
    res.json(item);
  } else {
    res.status(404).json({ error: 'Stock not found' });
  }
});

app.get('/api/requests', (req, res) => {
  // Sort by timestamp descending
  const sorted = [...emergencyRequests].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(sorted);
});

app.post('/api/requests', (req, res) => {
  const newRequest = {
    ...req.body,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    status: 'Pending'
  };
  emergencyRequests.push(newRequest);
  res.json(newRequest);
});

app.put('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const reqItem = emergencyRequests.find(r => r.id === id);
  if (reqItem) {
    reqItem.status = status;
    reqItem.updatedAt = new Date().toISOString();
    res.json(reqItem);
  } else {
    res.status(404).json({ error: 'Request not found' });
  }
});

export default app;
