require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));


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

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('CRITICAL: Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

startServer();
