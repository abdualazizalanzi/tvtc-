# السجل المهاري - دليل النشر على VPS

## المتطلبات
- خادم VPS مع Ubuntu 20.04 أو أحدث
- Node.js 18+
- PostgreSQL
- Nginx (للreverse proxy)
- PM2 (لإدارة العمليات)

---

## الخطوة 1: إعداد الخادم

### تحديث النظام
```bash
sudo apt update && sudo apt upgrade -y
```

### تثبيت Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### تثبيت PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### إنشاء قاعدة البيانات
```bash
sudo -u postgres psql
```

في واجهة PostgreSQL:
```sql
CREATE DATABASE skillrecord;
CREATE USER myuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE skillrecord TO myuser;
\q
```

---

## الخطوة 2: رفع الملفات للخادم

### باستخدام SCP
```bash
scp -r /Users/abdulaziz/Downloads/Attachment-Manager\ 2/* user@your-server-ip:/var/www/skill-record/
```

أو باستخدام Git:
```bash
cd /var/www
git clone your-repo-url skill-record
cd skill-record
```

---

## الخطوة 3: إعداد المتغيرات البيئية

```bash
cp .env.production .env
nano .env
```

أضف المتغيرات التالية:
```env
DATABASE_URL=postgresql://myuser:your_password@localhost:5432/skillrecord
SESSION_SECRET=your-super-secret-random-string-change-this
NODE_ENV=production
PORT=5000
```

---

## الخطوة 4: تثبيت المتطلبات وبناء المشروع

```bash
npm install
npm run build
```

---

## الخطوة 5: إعداد PM2 لإدارة العملية

```bash
npm install -g pm2
pm2 start npm --name "skill-record" -- start
pm2 save
pm2 startup
```

---

## الخطوة 6: إعداد Nginx كـ Reverse Proxy

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/skill-record
```

أضف التالي:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

تفعيل الموقع:
```bash
sudo ln -s /etc/nginx/sites-available/skill-record /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## الخطوة 7: إعداد SSL (HTTPS) - اختياري

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## أوامر إدارة مفيدة

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs skill-record

# إعادة تشغيل
pm2 restart skill-record

# إيقاف
pm2 stop skill-record
```

---

## حل المشاكل الشائعة

### خطأ في الاتصال بقاعدة البيانات
- تأكد من صحة DATABASE_URL
- تحقق من أن PostgreSQL يعمل: `sudo systemctl status postgresql`

### خطأ في الملفات الثابتة
- تأكد من تشغيل `npm run build`
- تحقق من وجود مجلد `dist/public`

