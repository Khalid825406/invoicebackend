require('dotenv').config(); // 🟰 Sabse upar .env load karo
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose.connect(process.env.MONGO_DB)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Models
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const InvoiceSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  invoiceNumber: String,
  voucher: { type: Number, default: 0 },
  voucher_nt: { type: Number, default: 0 },
  voucher_ar: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

const Company = mongoose.model('Company', CompanySchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);

// Routes
const router = express.Router();

// Health Check
router.get('/', (req, res) => {
  res.send('🚀 Server is running!');
});

// Get all companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new company
router.post('/companies', async (req, res) => {
  const company = new Company({ name: req.body.name });
  try {
    const newCompany = await company.save();
    res.status(201).json(newCompany);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single company by ID
router.get('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get invoices for a company
router.get('/companies/:id/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find({ company: req.params.id });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new invoice
router.post('/invoices', async (req, res) => {
  const invoice = new Invoice({
    company: req.body.companyId,
    invoiceNumber: req.body.invoiceNumber,
    voucher: req.body.voucher,
    voucher_nt: req.body.voucher_nt,
    voucher_ar: req.body.voucher_ar,
    total: req.body.total,
    balance: req.body.total,
  });

  try {
    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Use router under /api
app.use('/api', router);

// 🟰 Export app correctly
module.exports = app; // ✅ For Vercel

// 🛠 For local development (localhost)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });
}