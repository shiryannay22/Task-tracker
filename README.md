# 📋 לוח משימות - Task Tracker

אפליקציית ניהול משימות בזמן אמת ליעל ושיר עם סנכרון Firebase.

## 🚀 איך להשתמש

### Option 1: בClauude (הכי פשוט)
1. פתחי את השיחה ב-Claude
2. לחצי על artifact `task-tracker.jsx`
3. סיימת! 🎉

### Option 2: כקובץ JSX במקום אחר
1. העתיקי את `task-tracker.jsx`
2. זרקי אותו ל-artifact חדש
3. הוסיפי את הFirebase URL שלך ב-`VITE_FIREBASE_DB_URL`

## ✨ תכונות

- ✅ סנכרון בזמן אמת בין יעל ושיר
- ✅ ניהול משימות עם דחיפויות
- ✅ עדכון סטטוס (טרם התחיל, בתהליך, הושלם)
- ✅ תאריכי יעד עם התראות
- ✅ משימות חוזרות (שבועית, חודשית)
- ✅ ממשק מודרני

## 🔧 Setup

כל שנדרש זה **Firebase Realtime Database URL**:

```
https://tasks-5745a-default-rtdb.europe-west1.firebasedatabase.app
```

**Firebase Rules (חשוב!):**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## 👥 משתמשות

- **יעל** - מנהלת (הוספה, עריכה, מחיקה)
- **שיר** - עובדת (עדכון סטטוס)

## 📝 לרישיון

MIT - תעשי מה שאתה רוצה 😊

---

**שאלות?** פשוט תשאלי! 💬
