import { useState, useEffect } from "react";

const API = "https://spliteasy-ramkumar.onrender.com/api";

function App() {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const loadData = async () => {
    const p = await fetch(`${API}/people`).then(r => r.json());
    setMembers(p);
    if (p.length > 0) setPaidBy(p[0].name);
    const e = await fetch(`${API}/expenses`).then(r => r.json());
    setExpenses(e);
  };

  useEffect(() => { loadData(); }, []);

  const addMember = async () => {
    if (newMember.trim() === "") return;
    await fetch(`${API}/people`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMember.trim() })
    });
    setNewMember(""); loadData();
  };

  const deleteMember = async (id) => {
    await fetch(`${API}/people/${id}`, { method: "DELETE" });
    loadData();
  };

  const addExpense = async () => {
    if (!desc || !amount) return alert("Description aur Amount bharo");
    await fetch(`${API}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: desc, amount: Number(amount), paidBy })
    });
    setDesc(""); setAmount(""); loadData();
  };

  const deleteExpense = async (id) => {
    await fetch(`${API}/expenses/${id}`, { method: "DELETE" });
    loadData();
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = members.length > 0 ? total / members.length : 0;
  const balances = members.map((m) => {
    const paid = expenses.filter((e) => e.paidBy === m.name).reduce((sum, e) => sum + e.amount, 0);
    return { name: m.name, id: m._id, paid, balance: paid - perPerson };
  });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px 15px 40px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: "620px", margin: "auto" }}>
        
        {/* HEADER */}
        <div style={{ textAlign: "center", color: "white", marginBottom: "25px" }}>
          <div style={{ fontSize: "50px" }}>💸</div>
          <h1 style={{ fontSize: "36px", margin: "5px 0", fontWeight: "800", letterSpacing: "-1px" }}>SplitEasy</h1>
          <p style={{ opacity: 0.9, margin: 0, fontSize: "15px" }}>Dosto ke saath hisab, ab bina jhanjhat ke ✨</p>
        </div>

        {/* SUMMARY CARD */}
        <div style={{ background: "white", borderRadius: "20px", padding: "20px", display: "flex", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", marginBottom: "20px" }}>
          <div><p style={{ margin: 0, color: "#888", fontSize: "13px" }}>TOTAL SPENT</p><h2 style={{ margin: "5px 0 0", fontSize: "28px" }}>₹{total}</h2></div>
          <div style={{ textAlign: "center" }}><p style={{ margin: 0, color: "#888", fontSize: "13px" }}>MEMBERS</p><h2 style={{ margin: "5px 0 0", fontSize: "28px" }}>{members.length}</h2></div>
          <div style={{ textAlign: "right" }}><p style={{ margin: 0, color: "#888", fontSize: "13px" }}>PER PERSON</p><h2 style={{ margin: "5px 0 0", fontSize: "28px", color: "#7c3aed" }}>₹{perPerson.toFixed(0)}</h2></div>
        </div>

        {/* MEMBERS */}
        <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 15px" }}>👥 Group Members</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <input value={newMember} onChange={(e) => setNewMember(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMember()} placeholder="Naam likho - Aman" style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "2px solid #eee", outline: "none", fontSize: "15px" }} />
            <button onClick={addMember} style={{ padding: "12px 20px", background: "#111", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>+ Add</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "15px" }}>
            {members.length === 0 && <p style={{ color: "#999", margin: 0 }}>Koi member nahi hai, pehle add karo 👆</p>}
            {members.map((m, i) => (
              <span key={m._id} style={{ background: i % 2 === 0 ? "#ede9fe" : "#dcfce7", padding: "8px 12px", borderRadius: "20px", fontWeight: "600", fontSize: "14px" }}>
                {m.name} <button onClick={() => deleteMember(m._id)} style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontWeight: "bold" }}>✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* ADD EXPENSE */}
        <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 15px" }}>🧾 Naya Kharcha</h3>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Kya kharcha? Dinner, Petrol..." style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #eee", outline: "none", marginBottom: "10px", boxSizing: "border-box", fontSize: "15px" }} />
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount - ₹900" style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #eee", outline: "none", marginBottom: "10px", boxSizing: "border-box", fontSize: "15px" }} />
          <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #eee", outline: "none", marginBottom: "12px", boxSizing: "border-box", fontSize: "15px", background: "white" }}>
            {members.map((m) => <option key={m._id} value={m.name}>{m.name} ne diya 💰</option>)}
          </select>
          <button onClick={addExpense} style={{ width: "100%", padding: "14px", background: "linear-gradient(90deg, #16a34a, #22c55e)", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "16px", cursor: "pointer" }}>+ Expense Add Karo</button>
        </div>

        {/* EXPENSE LIST */}
        <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 15px" }}>📋 Saare Kharcha ({expenses.length})</h3>
          {expenses.length === 0 && <p style={{ color: "#999", margin: 0 }}>Abhi koi kharcha nahi hai.</p>}
          {expenses.map((e) => (
            <div key={e._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "12px", marginBottom: "8px" }}>
              <div><b style={{ fontSize: "15px" }}>{e.title}</b><div style={{ fontSize: "13px", color: "#888" }}>{e.paidBy} ne diya</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><b>₹{e.amount}</b><button onClick={() => deleteExpense(e._id)} style={{ border: "none", background: "#fee2e2", color: "#ef4444", padding: "6px 10px", borderRadius: "8px", cursor: "pointer" }}>🗑️</button></div>
            </div>
          ))}
        </div>

        {/* BALANCES */}
        <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
          <h3 style={{ margin: "0 0 15px" }}>⚖️ Kisko Kitna Dena / Lena Hai?</h3>
          {balances.map((b) => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", borderRadius: "12px", marginBottom: "8px", background: b.balance >= 0 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${b.balance >= 0 ? "#bbf7d0" : "#fecaca"}` }}>
              <div><b>{b.name}</b><div style={{ fontSize: "13px", color: "#666" }}>Diya: ₹{b.paid}</div></div>
              <span style={{ color: b.balance >= 0 ? "#16a34a" : "#dc2626", fontWeight: "800", fontSize: "14px" }}>
                {b.balance >= 0 ? `+ ₹${b.balance.toFixed(0)} Milega 🤑` : `- ₹${Math.abs(b.balance).toFixed(0)} Dena hai 😅`}
              </span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "white", opacity: 0.8, marginTop: "20px", fontSize: "13px" }}>Made with ❤️ by Ram - SplitEasy</p>
      </div>
    </div>
  );
}
export default App;