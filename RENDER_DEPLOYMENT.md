# خطوات النشر على Render.com

## متطلبات
- حساب GitHub
- حساب Render.com

---

## الخطوة 1: ربط GitHub
1. اذهب إلى https://dashboard.render.com
2. سجّل دخول باستخدام GitHub
3. اضغط "New" > "Web Service"

## الخطوة 2: اختيار المشروع
1. ابحث عن repository "tvtc-" في قائمة GitHub
2. اضغط "Connect"

## الخطوة 3: إعدادات البناء
```
Name: tvtc-skill-record
Region: Frankfurt (أو أقرب منطقة)
Branch: main
```

## الخطوة 4: إعدادات النشر
```
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

## الخطوة 5: المتغيرات البيئية
أضف المتغيرات التالية:
- `NODE_ENV` = `production`
- `PORT` = `5000`
- `SESSION_SECRET` = (أي نص عشوائي طويل)

## الخطوة 6: قاعدة البيانات
1. اضغط "New" > "PostgreSQL"
2. Name: `tvtc-db`
3. بعد الإنشاء، انسخ `Internal Database URL`
4. أضفها كـ `DATABASE_URL` في إعدادات Web Service

## الخطوة 7: النشر
1. اضغط "Create Web Service"
2. انتظر البناء (~5-10 دقائق)
3. احصل على الرابط من `https://tvtc-skill-record.onrender.com`

---

## ملاحظات مهمة

### المجاني:
- Render.com يوفر خدمة مجانية تتضمن:
  - 750 ساعة تشغيل/شهر
  - قاعدة بيانات PostgreSQL مجانية
  - ينام بعد 15 دقيقة من عدم الاستخدام

### مشاكل شائعة:
1. **خطأ في البناء**: تأكد من `npm run build` يعمل محلياً
2. **خطأ في قاعدة البيانات**: تأكد من `DATABASE_URL` صحيح
3. **Error 503**: التطبيق يحتاج وقت للتشغيل الأول

### تحديث التطبيق:
1. ارفع التغييرات على GitHub
2. Render سيتم البناء تلقائياً

