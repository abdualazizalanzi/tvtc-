# شرح طريقة النشر على Replit

## ما هو Replit؟
Replit هو منصة استضافة سحابية تتيح لك تشغيل التطبيقات مباشرة من GitHub أو رفع الملفات.

---

## الطريقة الأولى: النشر من GitHub (الطريقة الأسهل)

### الخطوة 1: رفع المشروع على GitHub
1. اذهب إلى github.com وأنشئ حساب جديد
2. أنشئ repository جديد
3. ارفع ملفات المشروع:
```bash
cd /Users/abdulaziz/Downloads/Attachment-Manager\ 2
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### الخطوة 2: النشر على Replit
1. اذهب إلى replit.com وأنشئ حساب
2. اضغط "Create Replit"
3. اختر "Import from GitHub"
4. اكتب اسم الـ repository
5. اضغط "Import from GitHub"

### الخطوة 3: إعداد المتغيرات البيئية
1. في Replit، اضغط على "Tools" > "Secrets"
2. أضف المتغيرات:
   - `DATABASE_URL` - رابط PostgreSQL
   - `SESSION_SECRET` - مفتاح سري عشوائي
   - `PORT` = 5000

### الخطوة 4: تشغيل التطبيق
1. اضغط زر "Run"
2. انتظر حتى يتم البناء
3. احصل على الرابط من上方

---

## الطريقة الثانية: رفع الملفات مباشرة

### الخطوة 1: ضغط المشروع
```bash
cd /Users/abdulaziz/Downloads
zip -r skill-record.zip Attachment-Manager\ 2/
```

### الخطوة 2: النشر على Replit
1. اذهب إلى replit.com
2. اضغط "Create Replit"
3. اختر "Upload zip file"
4. ارفع الملف المضغوط

### الخطوة 3: إعداد قاعدة البيانات
1. في Replit، اضغط على "Tools" > "Database"
2. أنشئ PostgreSQL جديد
3. انسخ رابط الاتصال

### الخطوة 4: إضافة المتغيرات
1. اضغط على "Tools" > "Secrets"
2. أضف:
   - `DATABASE_URL` = (رابط قاعدة البيانات من الخطوة 3)
   - `SESSION_SECRET` = (أي نص عشوائي)

### الخطوة 5: التشغيل
1. اكتب في terminal:
```bash
npm install
npm run build
npm start
```

---

## ملاحظات مهمة

### لتشغيل بدون أخطاء:
1. تأكد من إضافة `.replit` (تم إعداده مسبقاً)
2. تأكد من إضافة Secrets

### الحصول على رابط DATABASE_URL من Replit:
1. Tools > Database
2. اضغط على PostgreSQL
3. انسخ الـ "Connection string"

### إذا واجهت مشاكل:
- تأكد من `npm run build` يعمل محلياً أولاً
- تأكد من إضافة جميع الملفات (.env, uploads, etc.)

---

## البديل: استخدام Replit Autoscale

في ملف `.replit` الموجود:
- `deploymentTarget = "autoscale"` - يوسع تلقائياً
- `build = ["npm", "run build"]` - أمر البناء
- `run = ["node", "./dist/index.cjs"]` - أمر التشغيل
- `publicDir = "dist/public"` - ملفات الـ Frontend

