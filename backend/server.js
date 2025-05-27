require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const companiesRouter = require('./routes/companies');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Statik dosya sunumu
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', companiesRouter);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});