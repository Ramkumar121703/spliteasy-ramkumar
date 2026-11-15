 import { useState } from "react";

function App() {
  const [members, setMembers] = useState(["Aman", "Riya", "Karan"]);
  const [newMember, setNewMember] = useState("");
  const [expenses, setExpenses] = useState([
    { id: 1, desc: "Dinner", amount: 900, paidBy: "Aman" },
    { id: 2, desc: "Snacks", amount: 300, paidBy: "Riya" },
  ]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("Aman");

  const addMember = () => {
    if (newMember.trim() === "") return;
    setMembers([...members, newMember.trim()]);
    setNewMember("");
  };

  const addExpense = () => {
    if (!desc || !amount) return alert("Description aur Amount bharo");
    const newExp = { id: Date.now(), desc, amount: Number(amount), paidBy };
    setExpenses([...expenses, newExp]);
    setDesc(""); setAmount("");
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = members.length > 0 ? total / members.length : 0;

  const balances = members.map((m) => {
    const paid = expenses.filter((e) => e.paidBy === m).reduce((sum, e) => sum + e.amount, 0);
    return { name: m, paid, balance: paid - perPerson };
  });

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1>💸 SplitEasy</h1>
      <p>Apna kharcha aasani se baanto</p>

      <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3>1. Group Setup</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input value={newMember} onChange={(e) => setNewMember(e.target.value)} placeholder="Member ka naam" style={{ flex: 1, padding: "8px" }} />
          <button onClick={addMember} style={{ padding: "8px 15px", background: "black", color: "white", border: "none", borderRadius: "5px" }}>Add</button>
        </div>
        <p>Members: {members.join(", ")}</p>
      </div>

      <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3>2. Kharcha Add Karo</h3>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Kya kharcha? Dinner" style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount - 900" style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />
        <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }}>
          {members.map((m) => <option key={m} value={m}>{m} ne diya</option>)}
        </select>
        <button onClick={addExpense} style={{ width: "100%", padding: "10px", background: "#16a34a", color: "white", border: "none", borderRadius: "5px" }}>+ Expense Add Karo</button>
      </div>

      <h3>3. Saare Kharcha</h3>
      {expenses.map((e) => (
        <div key={e.id} style={{ display: "flex", justifyContent: "space-between", border: "1px solid #eee", padding: "10px", borderRadius: "8px", marginBottom: "8px" }}>
          <span><b>{e.desc}</b> - {e.paidBy} ne diya</span>
          <span>₹{e.amount} <button onClick={() => deleteExpense(e.id)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>Delete</button></span>
        </div>
      ))}

      <div style={{ background: "#f0f0f0", padding: "15px", borderRadius: "10px", marginTop: "20px" }}>
        <h3>4. Total Hisab</h3>
        <p>Total Spent: <b>₹{total}</b></p>
        <p>Per Person Share: <b>₹{perPerson.toFixed(2)}</b></p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>5. Kisko Kitna Dena / Lena Hai?</h3>
        {balances.map((b) => (
          <div key={b.name} style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
            <span><b>{b.name}</b> - Diya: ₹{b.paid}</span>
            <span style={{ color: b.balance >= 0 ? "green" : "red", fontWeight: "bold" }}>
              {b.balance >= 0 ? `Owed ₹${b.balance.toFixed(0)} - Milega` : `Owes ₹${Math.abs(b.balance).toFixed(0)} - Dena hai`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;