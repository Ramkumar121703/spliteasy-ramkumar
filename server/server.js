const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const Person = mongoose.model('Person', new mongoose.Schema({ name: String }));
const Expense = mongoose.model('Expense', new mongoose.Schema({
  title: String,
  amount: Number,
  paidBy: String,
  date: { type: Date, default: Date.now }
}));

app.get('/api/people', async (req, res) => res.json(await Person.find()));
app.post('/api/people', async (req, res) => res.json(await new Person(req.body).save()));
app.delete('/api/people/:id', async (req, res) => { await Person.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

app.get('/api/expenses', async (req, res) => res.json(await Expense.find().sort({ date: -1 })));
app.post('/api/expenses', async (req, res) => res.json(await new Expense(req.body).save()));
app.put('/api/expenses/:id', async (req, res) => res.json(await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/api/expenses/:id', async (req, res) => { await Expense.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

app.listen(5000, () => console.log('Server running on 5000'));