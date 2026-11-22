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
  description: String,
  amount: Number,
  paidBy: String,
  date: { type: Date, default: Date.now }
}));

// PEOPLE
app.get('/api/people', async (req, res) => res.json(await Person.find()));

app.post('/api/people', async (req, res) => {
  if (!req.body.name || !req.body.name.trim()) return res.status(400).json({ message: 'Name chahiye' });
  const exists = await Person.findOne({ name: req.body.name.trim() });
  if (exists) return res.status(400).json({ message: 'Ye person pehle se hai' });
  const p = await new Person({ name: req.body.name.trim() }).save();
  res.status(201).json(p);
});

// YE WALA MISSING THA - AB ADD KAR DIYA
app.put('/api/people/:id', async (req, res) => {
  if (!req.body.name || !req.body.name.trim()) return res.status(400).json({ message: 'Name chahiye' });
  const newName = req.body.name.trim();

  const person = await Person.findById(req.params.id);
  if (!person) return res.status(404).json({ message: 'Person nahi mila' });

  const exists = await Person.findOne({ name: newName });
  if (exists && exists._id.toString() !== req.params.id) {
    return res.status(400).json({ message: 'Ye person pehle se hai' });
  }

  const oldName = person.name;
  person.name = newName;
  await person.save();

  // Naam badla to uske expenses me bhi naam badal do, warna hisab bigad jayega
  if (oldName !== newName) {
    await Expense.updateMany({ paidBy: oldName }, { paidBy: newName });
  }

  res.json(person);
});

app.delete('/api/people/:id', async (req, res) => {
  const person = await Person.findById(req.params.id);
  if (!person) return res.status(404).json({ message: 'Person nahi mila' });
  await Expense.deleteMany({ paidBy: person.name });
  await Person.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// EXPENSES
app.get('/api/expenses', async (req, res) => res.json(await Expense.find().sort({ date: -1 })));

app.post('/api/expenses', async (req, res) => {
  let { description, amount, paidBy } = req.body;
  if (!description || !description.trim()) return res.status(400).json({ message: 'Description chahiye' });
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount 0 se bada hona chahiye' });
  if (!paidBy) return res.status(400).json({ message: 'Aisa person nahi hai' });
  const person = await Person.findOne({ name: { $regex: new RegExp(`^${paidBy.trim()}$`, "i") } });
  if (!person) return res.status(400).json({ message: 'Aisa person nahi hai' });
  paidBy = person.name;
  const e = await new Expense({ description: description.trim(), amount, paidBy }).save();
  res.status(201).json(e);
});

app.put('/api/expenses/:id', async (req, res) => {
  let { description, amount, paidBy } = req.body;
  if (description !== undefined && !description.trim()) return res.status(400).json({ message: 'Description chahiye' });
  if (amount !== undefined && amount <= 0) return res.status(400).json({ message: 'Amount 0 se bada hona chahiye' });
  if (paidBy) {
    const person = await Person.findOne({ name: { $regex: new RegExp(`^${paidBy.trim()}$`, "i") } });
    if (!person) return res.status(400).json({ message: 'Aisa person nahi hai' });
    req.body.paidBy = person.name;
  }
  const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Expense nahi mila' });
  res.json(updated);
});

app.delete('/api/expenses/:id', async (req, res) => {
  const deleted = await Expense.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Expense nahi mila' });
  res.json({ ok: true });
});

// BALANCES - Hisab
app.get('/api/balances', async (req, res) => {
  const people = await Person.find();
  const expenses = await Expense.find();
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const share = people.length ? total / people.length : 0;
  const result = people.map(p => {
    const paid = expenses.filter(e => e.paidBy === p.name).reduce((sum, e) => sum + e.amount, 0);
    return { name: p.name, paid: paid, share: share, balance: paid - share };
  });
  res.json({ total, share, balances: result });
});

app.listen(process.env.PORT || 5000, () => console.log('Server running on ' + (process.env.PORT || 5000)));