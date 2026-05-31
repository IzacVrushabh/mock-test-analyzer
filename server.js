require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema
const DataSchema = new mongoose.Schema({
  docId: { type: String, default: 'main_data', unique: true },
  appData: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true, minimize: false });

const DataModel = mongoose.model('MockTestData', DataSchema);

// API Endpoints
app.get('/api/data', async (req, res) => {
  try {
    const doc = await DataModel.findOne({ docId: 'main_data' });
    if (doc) {
      res.json(doc.appData);
    } else {
      res.json({});
    }
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const newAppData = req.body;
    await DataModel.findOneAndUpdate(
      { docId: 'main_data' },
      { appData: newAppData },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
