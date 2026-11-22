import { useState, useEffect } from "react";

const API = "https://spliteasy-ramkumar.onrender.com/api";

function App() {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const p = await fetch(`${API}/people`).then(r => r.json());
      setMembers(p);
      if (p.length > 0 && !paidBy) setPaidBy(p[0].name);
      const e = await fetch(`${API}/expenses`).then(r => r.json());
      setExpenses(e);
      setError("");
    } catch (err) {
      setError("Server se connect nahi ho raha. Thodi der baad try karo.");
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const addMember = async () => {
    if (newMember.trim() === "") return;
    const res = await fetch(`${API}/people`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMember.trim() })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    setNewMember(""); loadData();
  };

  const deleteMember = async (id) => {
    if (!window.confirm("Is member aur uske kharche delete kar du?")) return;
    await fetch(`${API}/people/${id}`, { method: "DELETE" });
    loadData();
  };

  const addExpense = async () => {
    if (!desc || !amount) return alert("Description aur Amount bharo");
    const url = editId ? `${API}/expenses/${editId}` : `${API}/expenses`;
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: desc, amount: Number(amount), paidBy })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    setDesc(""); setAmount(""); setEditId(null); loadData();
  };

  const startEdit = (e) => {
    setEditId(e._id);
    setDesc(e.description || e.title);
    setAmount(e.amount);
    setPaidBy(e.paidBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (loading) return <div style={{ textAlign: "center", padding: "50px", fontFamily: "sans-serif" }}><h2>Loading... ⏳</h2><p>Server se data aa raha hai</p></div>;
  if (error) return <div style={{ textAlign: "center", padding: "50px", fontFamily: "sans-serif" }}><h2>😢 {error}</h2><button onClick={loadData} style={{ padding: "10px 20px", borderRadius: "10px", background: "#111", color: "white", border: "none", cursor: "pointer" }}>Dobara Try Karo</button></div>;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px 15px 40px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: "620px", margin: "auto" }}>
        <div style={{ textAlign: "center", color: "white", marginBottom: "25px" }}>
          <div style={{ fontSize: "50px" }}>💸</div>
          <h1 style={{ fontSize: "36px", margin: "5px 0", fontWeight: "800", letterSpacing: "-1px" }}>SplitEasy</h1>
          <p style={{ opacity: 0.9, margin: 0, fontSize: "15px" }}>Dosto ke saath hisab, ab bina jhanjhat ke ✨</p>
        </div>

        <div style={{ background: "white", borderRadius: "20px", padding: "20px", display: "flex", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", marginBottom: "20px" }}>
          <div><p style={{ margin: 0, color: "#888", fontSize: "13px" }}>TOTAL SPENT</p><h2 style={{ margin: "5px 0 0", fontSize: "28px" }}>₹{total}</h2></div>
          <div style={{ textAlign: "center" }}><p style={{ margin: 0, color: "#888", fontSize: "13px" }}>MEMBERS</p><h2 style={{ margin: "5px 0 0", fontSize: "28px" }}>{members.length}</h2></div>
          <div style={{ textAlign: "right" }}><p style={{ margin: 0, color: "#888", fontSize: "13px" }}>PER PERSON</p><h2 style={{ margin: "5px 0 0", fontSize: "28px", color: "#7c3aed" }}>₹{perPerson.toFixed(0)}</h2></div>
        </div>

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

        <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 15px" }}>🧾 {editId ? "Kharcha Edit Karo" : "Naya Kharcha"}</h3>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Kya kharcha? Dinner, Petrol..." style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #eee", outline: "none", marginBottom: "10px", boxSizing: "border-box", fontSize: "15px" }} />
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount - ₹900" style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #eee", outline: "none", marginBottom: "10px", boxSizing: "border-box", fontSize: "15px" }} />
          <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #eee", outline: "none", marginBottom: "12px", boxSizing: "border-box", fontSize: "15px", background: "white" }}>
            {members.map((m) => <option key={m._id} value={m.name}>{m.name} ne diya 💰</option>)}
          </select>
          <button onClick={addExpense} style={{ width: "100%", padding: "14px", background: editId ? "#7c3aed" : "linear-gradient(90deg, #16a34a, #22c55e)", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "16px", cursor: "pointer" }}>{editId ? "Update Karo" : "+ Expense Add Karo"}</button>
          {editId && <button onClick={() => { setEditId(null); setDesc(""); setAmount(""); }} style={{ width: "100%", padding: "10px", marginTop: "8px", background: "#eee", border: "none", borderRadius: "12px", cursor: "pointer" }}>Cancel Edit</button>}
        </div>

        <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 15px" }}>📋 Saare Kharcha ({expenses.length})</h3>
          {expenses.length === 0 && <p style={{ color: "#999", margin: 0 }}>Abhi koi kharcha nahi hai.</p>}
          {expenses.map((e) => (
            <div key={e._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "12px", marginBottom: "8px" }}>
              <div><b style={{ fontSize: "15px" }}>{e.description || e.title}</b><div style={{ fontSize: "13px", color: "#888" }}>{e.paidBy} ne diya • {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><b>₹{e.amount}</b>
                <button onClick={() => startEdit(e)} style={{ border: "none", background: "#dbeafe", color: "#2563eb", padding: "6px 10px", borderRadius: "8px", cursor: "pointer" }}>✏️</button>
                <button onClick={() => deleteExpense(e._id)} style={{ border: "none", background: "#fee2e2", color: "#ef4444", padding: "6px 10px", borderRadius: "8px", cursor: "pointer" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

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