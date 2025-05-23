const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Companies endpoint
router.get('/companies', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const companies = await db.collection('companies').find({}).toArray();
    res.json(companies);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

module.exports = router;