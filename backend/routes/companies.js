const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya formatı. Sadece JPEG, PNG ve GIF dosyaları yüklenebilir.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Dosya silme yardımcı fonksiyonu
const deleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// Companies endpoint
router.get('/company/all', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const companies = await db.collection('companies').find({}).toArray();
    res.json({ success: true, companies });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch companies' });
  }
});

// Yeni şirket ekle
router.post('/company', upload.single('companyLogo'), async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const companyData = {
      ...req.body,
      companyLogo: req.file ? `/uploads/images/${req.file.filename}` : null,
      createdAt: new Date()
    };
    const result = await db.collection('companies').insertOne(companyData);
    res.json({ success: true, company: { ...companyData, _id: result.insertedId } });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to add company' });
  }
});

// Şirket güncelle
router.put('/company/:id', upload.single('companyLogo'), async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const updateData = { ...req.body };
    
    // Eski logoyu sil
    if (req.file) {
      const oldCompany = await db.collection('companies').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
      if (oldCompany && oldCompany.companyLogo) {
        deleteFile(oldCompany.companyLogo);
      }
      updateData.companyLogo = `/uploads/images/${req.file.filename}`;
    }

    const result = await db.collection('companies').updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: updateData }
    );
    res.json({ success: true, company: { ...updateData, _id: req.params.id } });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to update company' });
  }
});

// Şirket sil
router.delete('/company/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const company = await db.collection('companies').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    
    if (company && company.companyLogo) {
      deleteFile(company.companyLogo);
    }
    
    await db.collection('companies').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete company' });
  }
});

module.exports = router;