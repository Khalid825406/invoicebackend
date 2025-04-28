const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose.connect('mongodb://localhost:27017/invoiceCRM', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Models
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const InvoiceSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  invoiceNumber: String,
  voucher: { type: Number, default: 0 },
  voucher_nt: { type: Number, default: 0 },
  voucher_ar: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

const Company = mongoose.model('Company', CompanySchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);

// Routes

// Get all companies
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a company
app.post('/api/companies', async (req, res) => {
  const company = new Company({
    name: req.body.name
  });

  try {
    const newCompany = await company.save();
    res.status(201).json(newCompany);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
    try {
      const company = await Company.findById(req.params.id); // Mongoose ya jo bhi ORM use kar rahe ho
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      res.json(company);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
// Get invoices for a company
app.get('/api/companies/:id/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find({ company: req.params.id });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create an invoice
app.post('/api/invoices', async (req, res) => {
  const invoice = new Invoice({
    company: req.body.companyId,
    invoiceNumber: req.body.invoiceNumber,
    voucher: req.body.voucher,
    voucher_nt: req.body.voucher_nt,
    voucher_ar: req.body.voucher_ar,
    total: req.body.total,
    balance: req.body.total
  });

  try {
    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});