# Deployment Guide - السجل المهاري

## متطلبات الاستضافة

1. **خادم Node.js** - الإصدار 18 أو أعلى
2. **قاعدة بيانات PostgreSQL**
3. **ذاكرة وصول عشوائي** - 512MB على الأقل

---

## خطوات النشر

### 1. تحضير قاعدة البيانات

أنشئ قاعدة بيانات PostgreSQL من أحد المزودين:
- **Neon** (مجاني) - https://neon.tech
- **Supabase** (مجاني) - https://supabase.com
- **Railway** - https://railway.app
- **Render** - https://render.com

احصل على رابط الاتصال (Connection String)

### 2. إعداد المتغيرات البيئية

انسخ ملف `.env.production` إلى `.env` وعدّل القيم:

```bash
cp .env.production .env
```

ثم عدّل ملف `.env` وضع:
- `DATABASE_URL` - رابط قاعدة البيانات
- `SESSION_SECRET` - مفتاح سري عشوائي (يمكن توليده)

### 3. تثبيت المتطلبات وتشغيل البناء

```bash
# تثبيت المكتبات
npm install

# بناء المشروع
npm run build

# تشغيل الخادم
npm start
```

---

## النشر على منصات مختلفة

### Render.com (موصى به)

1. أنشئ حساب على Render.com
2. أنشئ PostgreSQL Database
3. أنشئ Web Service:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: أضف DATABASE_URL و SESSION_SECRET

### Railway

1. أنشئ حساب على Railway.app
2. أنشئ مشروع جديد + PostgreSQL
3. اربط المشروع بـ GitHub
4. أضف المتغيرات البيئية

### VPS (خادم خاص)

```bash
#.upload files
scp -r . user@your-server:/var/www/app

# SSH to server
ssh user@your-server

# Install Node.js if not installed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Build
npm run build

# Run with PM2
pm2 start npm --name "skill-record" -- start

# Setup auto-restart
pm2 save
pm2 startup
```

---

## حل المشاكل الشائعة

### خطأ في الاتصال بقاعدة البيانات
- تأكد من صحة `DATABASE_URL`
- تأكد من أن قاعدة البيانات允许 الاتصال من IP الخادم

### خطأ في الجلسة
- تأكد من تعيين `SESSION_SECRET`

### مشكلة في الملفات الثابتة
- تأكد من تشغيل `npm run build` بنجاح
- تحقق من وجود مجلد `dist/public`

---

## هيكل الملفات بعد البناء

```
dist/
├── index.cjs          # الخادم (ملف واحد)
└── public/            # واجهة المستخدم
    ├── index.html
    ├── assets/
    └── ...
```

