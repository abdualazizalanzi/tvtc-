# الملفات المطلوبة للرفع على Netlify

## 📋 القائمة الكاملة:

### ملفات الجذر (Root):
```
✅ package.json
✅ package-lock.json
✅ tsconfig.json
✅ vite.config.ts
✅ tailwind.config.ts
✅ postcss.config.js
✅ components.json
✅ netlify.toml
```

### مجلد client:
```
✅ client/src/
✅ client/index.html
✅ client/public/
```

### ملفات البناء (بعد npm run build):
```
✅ dist/public/
```

---

## 🚀 طريقة الرفع:

### الطريقة الأولى: رفع المشروع كاملاً (Netlify يبني تلقائياً)

ارفع كل المجلدات ما عدا:
- ❌ node_modules/ (سيتم إنشاؤه تلقائياً)
- ❌ .git/
- ❌ .local/
- ❌ sqlite.db
- ❌ uploads/

### الطريقة الثانية: رفع الملفات المبنية فقط

1. ارفع `dist/public/` كمجلد النشر
2. استخدم Firebase كـ Backend

---

## 📁 المجلدات المطلوبة للرفع:

```
/
├── package.json          ✅
├── package-lock.json    ✅
├── tsconfig.json        ✅
├── vite.config.ts       ✅
├── tailwind.config.ts   ✅
├── postcss.config.js    ✅
├── components.json      ✅
├── netlify.toml         ✅
├── client/              ✅
│   ├── src/
│   ├── index.html
│   └── public/
└── dist/public/         ✅ (الواجهة المبنية)
```

---

## 🔧 المجلدات التي لا تحتاج رفعها:

- node_modules/ - سيتم تثبيتها تلقائياً
- .git/
- .local/
- sqlite.db - قاعدة البيانات (سيتم استخدام Firebase بدلاً منها)
- uploads/
- attached_assets/
- server/ - للـ API استخدم Firebase أو Netlify Functions
- script/
- shared/

---

## ⚡ لتشغيل المشروع على Netlify:

1. **فعّل Firebase Firestore** في Firebase Console
2. **فعّل Firebase Authentication**
3. **ارفع الملفات** إلى Netlify
4. **أضف المتغيرات البيئية** في Netlify

المشروع يستخدم **Firebase كـ Backend** لذا لا تحتاج لرفع مجلد server/

