# ⚡ Setup מהיר

## 1️⃣ Firebase (חד פעם בלבד)

1. כנסי ל-[Firebase Console](https://console.firebase.google.com)
2. בחרי את הפרויקט `tasks-5745a`
3. לכי ל-**Realtime Database** → **Rules**
4. החליפי את הכללים:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

5. לחצי **Publish** ✅

## 2️⃣ GitHub

```bash
git clone https://github.com/YOUR-USERNAME/task-tracker.git
cd task-tracker
git add .
git commit -m "Initial commit"
git push origin main
```

## 3️⃣ שימוש

- פתחי את ה-artifact ב-Claude
- שיר ויעל רואות את אותן המשימות בזמן אמת
- סיימת! 🎉

---

**זהו!** כל דבר אחר אופציונלי. 😎
