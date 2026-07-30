import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Calendar, Trash2, Check, PlayCircle, Circle, Pencil } from "lucide-react";

const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEgklEQVR4nO2WT2wUVRzHv783s9vZmSki5YCJUCInW//GIMrFmPRgiJh42A2J8Q9dyRo9NCGwbVCcDofS3S7RKJEsdHfFyGU2GA9GjdE0JBoTCOileDBiCEkhoKCyO9vu7Hs/D7tb+3fbEjwY+V7ezJuZ3+/z+/PeG+CO7ug/JWaC52lwHDFr3vM0eJ727zqf62BsTMchLwKAZs3PhVtCtPQrIAAMAEYmv16n0DYm3sRShkHEIGIiUSbmH0v6jc/Q1zeFqKehGJO3A2DauZXO7wbQBU3/WraJ7yfl71dw/XoAe1PE0vSN4OrTkPJRhir6yV1fLheiFQDBcQjYGDZNzgji8VIyfqSVMTuTXctS72fgZ78/fhSepyG2vEzMV7RecyuVGzFTuWcBANlsCI4jppsRqI8z7wGY6dybdroQBbDinqir0XDW8OgOO5V/vW5oTG8Y1FsBzwRvO1jYCGYC86KZXuwBwTlsmZZ5wC9fTKK7m3HjhjD/Cu2BFuogpaqk1NlScudJK1N4ASQeIhKGksGE32lnEItJe/j4/Uy1Z8r98XdalWJ+euoRsGkZW8H0A1y3hlhMWn/oQyS54v/Zts80IkOsuM1K57NgFZQVHSjx1QEwjMivN/cDQGng5Z8AIVY5x9asrA+a6U/n3rBGRh8AAGNktNNK5z+a+2pk+Njjc+fMVO7EqkPH1gCAnc49HxnJbQGwaC/MnxwfZwAAI0wUuQIAmhSrGPhtJiCYqTKw6/S04eZIuBYEhgkAUonLJGk1AOB894Llng8wOFgHAKlwSFUBoFwJfgGwDk7BaAASiBiOI+C6qun8LqewmgCrcl/bZQAggcmFnLYGiBVFPRAVTEpYAAA34RP4c8uU++C6ClGv/l39WoPrKriuCkzsJ0VfNGvOKjA0HTcBAF2NzC4JEG2MTFdZVjcATHDG9HIy/jFIux5JFV5DMSaRzYYAAMWYhFMwrFT+AxBTaaD3k+YzIn1NNaCJ2ZldEiCqACAI4xyYHgGI0X2N4TiinNz5LiCvREby25FIBO1DxzusdK7HsrjIQOAne3cj6mmYmJCIehoB7VObrEtolmxZAI3aTu2OXxAMw8jk108vI8cRlf5XPw0J+Z2Zzr3Eei3GTNsZouj39/Yhmw2ha5zhusrcXH5QCVxALCbrW/rCWnibHBxkMJPi2kkh8SKYCa6rgG4djiNqStslmO1SMn6ECBuYa+cBAIlEANdVdia7FqTuqZy2z/3z7cJa/DBqdLiRHn1SY9paNkqH0dc3BccRltW5A8BTCMu3hR+uSb0WrwejnfPPmN/giUth2DYhkfAx40RdGcAMiMhIbgsxepjoq8re3jMAEBnKbREaBlnT3vL3vHI2Mnz0XhKiB6DNguGV+uOnppdpCy39Q9Iw0v7+8Q45WXuOmO6Gpk8IoV2UtepBAn9b7rSdZp+Y6cI6MO/zjXV70bet2ir65WvGNtqRGm03D+Uett470WNmPnxsVjDNXdJh0eoEvFXR9JHbSit0fGuUjiNwvpuaS24Ru7ch9Xf0f9Df1Hz/XvUda2oAAAAASUVORK5CYII=";

const URGENCY = {
  high: { label: "דחוף", color: "#C96A46", bg: "#FBEAE1" },
  medium: { label: "בינוני", color: "#B98A2E", bg: "#FBF1DF" },
  low: { label: "נמוך", color: "#5E9678", bg: "#E7F3EC" },
};

const STATUS = {
  todo: { label: "טרם התחיל", color: "#7A8088", bg: "#F0F0EE", icon: Circle },
  doing: { label: "בתהליך", color: "#2C8E82", bg: "#E1F3F0", icon: PlayCircle },
  done: { label: "הושלם", color: "#1B3A4B", bg: "#E4EBEE", icon: Check },
};

const URGENCY_ORDER = { high: 0, medium: 1, low: 2 };

// Firebase Realtime Database URL
const FIREBASE_DB_URL = "https://tasks-5745a-default-rtdb.europe-west1.firebasedatabase.app";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

function isOverdue(iso, status) {
  if (!iso || status === "done") return false;
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function getNextRecurrenceDate(baseDate, recurrence) {
  if (recurrence === "none") return null;
  const date = new Date(baseDate);
  if (recurrence === "monthly") {
    date.setMonth(date.getMonth() + 1);
  } else if (recurrence === "weekly") {
    date.setDate(date.getDate() + 7);
  }
  return date.toISOString().slice(0, 10);
}

function checkRecurringTasks(tasks) {
  if (!tasks || tasks.length === 0) return tasks;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newTasks = [...tasks];
  let modified = false;

  for (const task of newTasks) {
    if (task.recurrence !== "none" && task.status === "done" && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate <= today) {
        const nextDate = getNextRecurrenceDate(task.dueDate, task.recurrence);
        if (nextDate && !newTasks.find(t => t.id === task.id + "-next" && t.dueDate === nextDate)) {
          newTasks.push({
            id: uid(),
            title: task.title,
            description: task.description,
            dueDate: nextDate,
            urgency: task.urgency,
            recurrence: task.recurrence,
            status: "todo",
            createdAt: new Date().toISOString(),
          });
          modified = true;
        }
      }
    }
  }

  return modified ? newTasks.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0)) : tasks;
}

export default function TaskTracker() {
  const [role, setRole] = useState("manager");
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState("מתחבר...");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", urgency: "medium", recurrence: "none" });

  // Firebase functions
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`${FIREBASE_DB_URL}/tasks.json`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const tasksArray = data ? Object.values(data) : [];
      const withRecurrence = checkRecurringTasks(tasksArray);
      setTasks(withRecurrence);
      setSyncStatus("✓ מסתנכרן");
      setError(null);
    } catch (e) {
      setSyncStatus("⚠ שגיאה בסנכרון");
      setError("לא הצלחתי להתחבר ל-Firebase");
      setTasks([]);
    }
  }, []);

  const saveTasks = useCallback(async (next) => {
    setTasks(next);
    try {
      const response = await fetch(`${FIREBASE_DB_URL}/tasks.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next.reduce((acc, t) => ({ ...acc, [t.id]: t }), {})),
      });
      if (!response.ok) throw new Error("Failed to save");
      setSyncStatus("✓ מסתנכרן");
      setError(null);
    } catch (e) {
      setSyncStatus("⚠ שגיאה בשמירה");
      setError("לא הצלחתי לשמור - בדוקי חיבור אינטרנט");
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const resetForm = () => {
    setForm({ title: "", description: "", dueDate: "", urgency: "medium", recurrence: "none" });
    setEditingId(null);
    setShowForm(false);
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const current = tasks || [];
    if (editingId) {
      const next = current.map((t) =>
        t.id === editingId
          ? { ...t, title: form.title.trim(), description: form.description.trim(), dueDate: form.dueDate, urgency: form.urgency, recurrence: form.recurrence }
          : t
      );
      saveTasks(next);
    } else {
      const newTask = {
        id: uid(),
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate,
        urgency: form.urgency,
        recurrence: form.recurrence,
        status: "todo",
        createdAt: new Date().toISOString(),
      };
      saveTasks([newTask, ...current]);
    }
    resetForm();
  };

  const startEdit = (task) => {
    setForm({ title: task.title, description: task.description || "", dueDate: task.dueDate || "", urgency: task.urgency, recurrence: task.recurrence || "none" });
    setEditingId(task.id);
    setShowForm(true);
  };

  const deleteTask = (id) => {
    saveTasks((tasks || []).filter((t) => t.id !== id));
    setConfirmDeleteId(null);
  };

  const setStatus = (id, status) => {
    const updated = (tasks || []).map((t) => (t.id === id ? { ...t, status } : t));
    saveTasks(checkRecurringTasks(updated));
  };

  const sorted = tasks
    ? [...tasks]
        .filter((t) => filter === "all" || t.status === filter)
        .sort((a, b) => {
          if (a.status === "done" && b.status !== "done") return 1;
          if (b.status === "done" && a.status !== "done") return -1;
          return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
        })
    : [];

  const counts = tasks
    ? {
        all: tasks.length,
        todo: tasks.filter((t) => t.status === "todo").length,
        doing: tasks.filter((t) => t.status === "doing").length,
        done: tasks.filter((t) => t.status === "done").length,
      }
    : { all: 0, todo: 0, doing: 0, done: 0 };

  const progressPct = counts.all > 0 ? Math.round((counts.done / counts.all) * 100) : 0;

  return (
    <div dir="rtl" style={{ fontFamily: "'Manrope', 'Segoe UI', sans-serif", background: "#F4F2ED", minHeight: "100vh", color: "#1B3A4B" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; font-family: inherit; -webkit-tap-highlight-color: transparent; }
        button:active { transform: scale(0.97); }
        input, textarea, select { font-family: inherit; }
        ::placeholder { color: #9BA3A8; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .task-card { animation: cardIn 0.28s ease both; transition: box-shadow 0.2s ease, transform 0.15s ease; }
        .task-card:active { transform: scale(0.99); }
        .sheet { animation: sheetUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .overlay { animation: fadeIn 0.2s ease both; }
        .chip-btn { transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease; }
        .status-btn { transition: all 0.15s ease; }
        .bar-fill { transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1); }
        .skeleton { background: linear-gradient(90deg, #EAE7DF 25%, #F4F2ED 50%, #EAE7DF 75%); background-size: 200% 100%; animation: shimmer 1.3s infinite linear; }
        input:focus, textarea:focus { outline: none; border-color: #2C8E82 !important; box-shadow: 0 0 0 3px rgba(44,142,130,0.14); }
      `}</style>

      {/* Header */}
      <div style={{ background: "#EFEDE6", padding: "26px 18px 24px", position: "relative", overflow: "hidden", borderBottom: "1px solid #E3E0D5" }}>
        <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: "1.5px solid rgba(44,142,130,0.18)", top: -110, left: -70 }} />
        <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", border: "1.5px solid rgba(44,142,130,0.14)", bottom: -90, right: -50 }} />
        <div style={{ position: "relative" }}>
          <h1 style={{ color: "#1B3A4B", fontSize: 22, margin: 0, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, letterSpacing: -0.3 }}>
            <div style={{ width: 44, height: 44, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: 6, flexShrink: 0 }}>
              <img src={LOGO} alt="לוגו" style={{ width: 32, height: 32, objectFit: "contain" }} />
            </div>
            לוח משימות
          </h1>
          <p style={{ color: "#5B6B72", fontSize: 13, margin: "6px 0 16px", fontWeight: 500 }}>
            {role === "manager" ? "תצוגת ניהול · הוספה ותעדוף" : "תצוגה אישית · דיווח התקדמות"}
            <span style={{ marginRight: 8, fontSize: 11, color: "#2C8E82", fontWeight: 600 }}>
              {syncStatus}
            </span>
          </p>

          {/* Role toggle */}
          <div style={{ display: "inline-flex", background: "#fff", borderRadius: 14, padding: 3, marginBottom: 18, border: "1px solid #E3E0D5" }}>
            {[
              { key: "manager", label: "יעל", color: "#1B3A4B" },
              { key: "employee", label: "שיר", color: "#2C8E82" },
            ].map((r) => {
              const active = role === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: active ? "5px 16px 5px 6px" : "5px 16px",
                    borderRadius: 11,
                    border: "none",
                    fontSize: 13.5,
                    fontWeight: 700,
                    background: active ? r.color : "transparent",
                    color: active ? "#fff" : "#8A9096",
                    transition: "all 0.2s ease",
                  }}
                >
                  {active && (
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10.5, fontWeight: 800 }}>
                      {r.label[0]}
                    </span>
                  )}
                  {r.label}
                </button>
              );
            })}
          </div>

          {counts.all > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5B6B72", marginBottom: 7, fontWeight: 600 }}>
                <span>{progressPct}% הושלם</span>
                <span>{counts.done} מתוך {counts.all}</span>
              </div>
              <div style={{ height: 7, background: "#E3E0D5", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #2C8E82, #5BB6AA)", borderRadius: 999, transition: "width 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status filter chips */}
      <div style={{ display: "flex", gap: 8, padding: "16px 16px 6px", overflowX: "auto" }}>
        {[
          { key: "all", label: "הכול", count: counts.all },
          { key: "todo", label: "טרם התחיל", count: counts.todo },
          { key: "doing", label: "בתהליך", count: counts.doing },
          { key: "done", label: "הושלם", count: counts.done },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="chip-btn"
            style={{
              flexShrink: 0,
              padding: "7px 15px",
              borderRadius: 11,
              border: filter === f.key ? "1.5px solid #1B3A4B" : "1.5px solid #E3E0D5",
              background: filter === f.key ? "#1B3A4B" : "#fff",
              color: filter === f.key ? "#fff" : "#5B6B72",
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {f.label} · {f.count}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ padding: "10px 16px 100px", display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks === null && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 88, borderRadius: 16 }} />
            ))}
          </div>
        )}

        {tasks !== null && sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "56px 20px", color: "#9BA3A8" }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: "#ECEDF2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Circle size={22} color="#B7BEC2" />
            </div>
            <p style={{ fontSize: 15, margin: 0, fontWeight: 700, color: "#5B6B72" }}>
              {filter === "all" ? "אין משימות עדיין" : "אין משימות בקטגוריה הזו"}
            </p>
            {role === "manager" && filter === "all" && <p style={{ fontSize: 13, marginTop: 6 }}>לחצי על + כדי להוסיף משימה ראשונה</p>}
          </div>
        )}

        {sorted.map((task) => {
          const u = URGENCY[task.urgency];
          const s = STATUS[task.status];
          const StatusIcon = s.icon;
          const overdue = isOverdue(task.dueDate, task.status);
          const confirming = confirmDeleteId === task.id;
          return (
            <div
              key={task.id}
              className="task-card"
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 15,
                boxShadow: "0 1px 2px rgba(27,58,75,0.04), 0 8px 20px -10px rgba(27,58,75,0.10)",
                border: "1px solid #EFEDE6",
                opacity: task.status === "done" ? 0.6 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 11 }}>
                  <div style={{ width: 3, borderRadius: 999, background: u.color, flexShrink: 0, alignSelf: "stretch" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: u.color, background: u.bg, padding: "2.5px 9px", borderRadius: 7 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: u.color, animation: task.urgency === "high" && task.status !== "done" ? "pulseDot 1.6s infinite ease-in-out" : "none" }} />
                        {u.label}
                      </span>
                      {task.dueDate && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: overdue ? "#C96A46" : "#9BA3A8" }}>
                          <Calendar size={10} />
                          {formatDate(task.dueDate)}
                          {overdue ? " · באיחור" : ""}
                        </span>
                      )}
                      {task.recurrence && task.recurrence !== "none" && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "#2C8E82", background: "#E1F3F0", padding: "2.5px 7px", borderRadius: 5 }}>
                          ↻ {task.recurrence === "monthly" ? "חודשי" : "שבועי"}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 15.5, fontWeight: 700, margin: 0, textDecoration: task.status === "done" ? "line-through" : "none", color: "#1B3A4B" }}>
                      {task.title}
                    </h3>
                    {task.description && <p style={{ fontSize: 13, color: "#6B767C", margin: "4px 0 0", lineHeight: 1.4, fontWeight: 500 }}>{task.description}</p>}
                  </div>
                </div>

                {role === "manager" && !confirming && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => startEdit(task)} style={{ border: "none", background: "#F4F2ED", borderRadius: 9, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#5B6B72" }} aria-label="ערוך משימה">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmDeleteId(task.id)} style={{ border: "none", background: "#FBEAEA", borderRadius: 9, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#C96A46" }} aria-label="מחק משימה">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {confirming && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
                    <span style={{ fontSize: 11.5, color: "#C96A46", fontWeight: 700, marginLeft: 2 }}>למחוק?</span>
                    <button onClick={() => deleteTask(task.id)} style={{ border: "none", background: "#C96A46", color: "#fff", borderRadius: 9, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}>מחיקה</button>
                    <button onClick={() => setConfirmDeleteId(null)} style={{ border: "none", background: "#F4F2ED", color: "#5B6B72", borderRadius: 9, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}>ביטול</button>
                  </div>
                )}
              </div>

              {role === "employee" ? (
                <div style={{ display: "flex", gap: 6, marginTop: 12, paddingRight: 14 }}>
                  {Object.entries(STATUS).map(([key, val]) => {
                    const Icon = val.icon;
                    const active = task.status === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setStatus(task.id, key)}
                        className="status-btn"
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          padding: "7px 4px",
                          borderRadius: 10,
                          border: active ? `1.5px solid ${val.color}` : "1.5px solid #EFEDE6",
                          background: active ? val.bg : "#fff",
                          color: active ? val.color : "#B7BEC2",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <Icon size={13} />
                        {val.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, marginRight: 14, padding: "6px 12px", borderRadius: 10, background: s.bg, color: s.color, fontSize: 12.5, fontWeight: 700 }}>
                  <StatusIcon size={13} />
                  {s.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ position: "fixed", bottom: 90, left: 16, right: 16, background: "#C96A46", color: "#fff", padding: "10px 14px", borderRadius: 12, fontSize: 13, textAlign: "center", boxShadow: "0 8px 20px rgba(201,106,70,0.35)", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {role === "manager" && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            position: "fixed",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#2C8E82",
            color: "#fff",
            border: "none",
            borderRadius: 15,
            padding: "13px 26px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14.5,
            fontWeight: 700,
            boxShadow: "0 10px 24px -6px rgba(44,142,130,0.45)",
          }}
        >
          <Plus size={17} strokeWidth={2.5} />
          משימה חדשה
        </button>
      )}

      {showForm && (
        <div className="overlay" style={{ position: "fixed", inset: 0, background: "rgba(27,58,75,0.35)", display: "flex", alignItems: "flex-end", zIndex: 20 }} onClick={resetForm}>
          <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", borderRadius: "22px 22px 0 0", padding: "10px 20px 22px", maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#E3E0D5", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, margin: 0, fontWeight: 800, letterSpacing: -0.2, color: "#1B3A4B" }}>{editingId ? "עריכת משימה" : "משימה חדשה"}</h2>
              <button type="button" onClick={resetForm} style={{ border: "none", background: "#F4F2ED", borderRadius: 9, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </div>

            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#5B6B72" }}>כותרת</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="לדוגמה: הכנת דוח רבעוני"
              style={{ width: "100%", padding: "11px 12px", borderRadius: 11, border: "1.5px solid #E3E0D5", marginTop: 5, marginBottom: 14, fontSize: 14.5, background: "#FAF9F5", fontWeight: 500, color: "#1B3A4B" }}
            />

            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#5B6B72" }}>תיאור</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="פרטים נוספים על המשימה…"
              rows={3}
              style={{ width: "100%", padding: "11px 12px", borderRadius: 11, border: "1.5px solid #E3E0D5", marginTop: 5, marginBottom: 14, fontSize: 14, resize: "none", background: "#FAF9F5", fontWeight: 500, color: "#1B3A4B" }}
            />

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#5B6B72" }}>תאריך יעד</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  style={{ width: "100%", padding: "10px 10px", borderRadius: 11, border: "1.5px solid #E3E0D5", marginTop: 5, fontSize: 13.5, background: "#FAF9F5", fontWeight: 500, color: "#1B3A4B" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#5B6B72" }}>דחיפות</label>
                <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
                  {Object.entries(URGENCY).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, urgency: key })}
                      className="chip-btn"
                      style={{
                        flex: 1,
                        padding: "10px 4px",
                        borderRadius: 11,
                        border: form.urgency === key ? `1.5px solid ${val.color}` : "1.5px solid #E3E0D5",
                        background: form.urgency === key ? val.bg : "#FAF9F5",
                        color: form.urgency === key ? val.color : "#B7BEC2",
                        fontSize: 11.5,
                        fontWeight: 700,
                      }}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#5B6B72" }}>חזרה על משימה</label>
            <div style={{ display: "flex", gap: 5, marginTop: 5, marginBottom: 20 }}>
              {[
                { key: "none", label: "ללא" },
                { key: "weekly", label: "שבועית" },
                { key: "monthly", label: "חודשית" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setForm({ ...form, recurrence: opt.key })}
                  className="chip-btn"
                  style={{
                    flex: 1,
                    padding: "10px 4px",
                    borderRadius: 11,
                    border: form.recurrence === opt.key ? "1.5px solid #2C8E82" : "1.5px solid #E3E0D5",
                    background: form.recurrence === opt.key ? "#E1F3F0" : "#FAF9F5",
                    color: form.recurrence === opt.key ? "#2C8E82" : "#B7BEC2",
                    fontSize: 11.5,
                    fontWeight: 700,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={submitForm}
              disabled={!form.title.trim()}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 13,
                border: "none",
                background: form.title.trim() ? "#2C8E82" : "#E3E0D5",
                color: form.title.trim() ? "#fff" : "#B7BEC2",
                fontSize: 15,
                fontWeight: 700,
                marginTop: 4,
                boxShadow: form.title.trim() ? "0 10px 24px -8px rgba(44,142,130,0.45)" : "none",
              }}
            >
              {editingId ? "שמירת שינויים" : "הוספת משימה"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
