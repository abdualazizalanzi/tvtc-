# تقرير بحثي شامل: متطلبات التطبيق وإضافة الصور للواجهات

## الملخص التنفيذي

هذا التقرير البحثي يقدم تحليلاً تفصيلياً للمشروع الحالي (نظام السجل المهاري - الكلية التقنية) ويحدد المتطلبات اللازمة لإضافة ميزة إدارة الصور في جميع واجهات التطبيق. يتضمن التقرير دراسة شاملة لقاعدة البيانات، نقاط النهاية API، والواجهات الحالية مع توصيات تفصيلية للتنفيذ.

---

## القسم الأول: نظرة عامة على المشروع

### 1.1 وصف المشروع

نظام السجل المهاري (Skill Record System) هو منصة متكاملة لإدارة الأنشطة والدورات التدريبية للطلاب في الكلية التقنية. يتيح النظام للطلاب إضافة أنشطتهم اللامنهجية، الالتحاق بالدورات التدريبية، والحصول على شهادات إنجاز.

### 1.2 التقنيات المستخدمة

- **Frontend**: React مع TypeScript، Tailwind CSS، Shadcn UI
- **Backend**: Node.js مع Express
- **Database**: SQLite مع Drizzle ORM
- **Authentication**: Firebase/Replit Auth
- **File Storage**: Local filesystem (uploads directory)

---

## القسم الثاني: تحليل قاعدة البيانات

### 2.1 الجداول المتعلقة بالصور

#### جدول الملفات الشخصية (studentProfiles)

```
- id: UUID (مفتاح أساسي)
- userId: مرجع للمستخدم
- studentId: الرقم التدريبي
- trainingId: رقم التدريب
- phone: رقم الهاتف
- major: التخصص
- role: الدور (student/trainer/supervisor)
- bio: النبذة الشخصية
- skills: المهارات (JSON array)
- languages: اللغات (JSON array)
- linkedIn: رابط LinkedIn
- github: رابط GitHub
- interests: الاهتمامات (JSON array)
- careerGoals: الأهداف المهنية
- profileImageUrl: رابط صورة الملف الشخصي ✅
- createdAt: تاريخ الإنشاء
```

#### جدول الأنشطة (activities)

```
- id: UUID
- userId: معرف المستخدم
- type: نوع النشاط
- nameAr/nameEn: الاسم بالعربي والإنجليزي
- organization: الجهة المنظمة
- hours: عدد الساعات
- startDate/endDate: تواريخ البداية والنهاية
- descriptionAr/descriptionEn: الوصف
- proofUrl: رابط إثبات النشاط ✅
- certificateUrl: رابط الشهادة ✅
- status: الحالة (submitted/under_review/approved/rejected)
- rejectionReason: سبب الرفض
- reviewedBy: المراجع
- reviewedAt: تاريخ المراجعة
```

#### جدول الدورات (courses)

```
- id: UUID
- titleAr/titleEn: العنوان
- descriptionAr/descriptionEn: الوصف
- category: الفئة
- duration: المدة
- instructorId: معرف المدرب
- imageUrl: رابط صورة الدورة ✅
- isPublished: حالة النشر
- createdAt: تاريخ الإنشاء
```

#### جدول الشهادات (certificates)

```
- id: UUID
- userId: معرف المستخدم
- courseId/activityId: مرجع للدورة/النشاط
- type: نوع الشهادة
- titleAr/titleEn: العنوان
- certificateNumber: رقم الشهادة
- issuedAt: تاريخ الإصدار
- verificationCode: رمز التحقق
```

---

## القسم الثالث: تحليل واجهات API

### 3.1 نقاط النهاية المتعلقة بالصور

#### رفع صورة الملف الشخصي

```
POST /api/upload/profile-image
- المصادقة: مطلوبة (isAuthenticated)
- نوع الملف: صورة (jpg, jpeg, png, gif, webp)
- الحد الأقصى: 5MB
- المجلد: uploads/
- الاسم: profile-{timestamp}-{filename}
```

**كود المعالجة في السيرفر:**

```typescript
const profileImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => 
      cb(null, `profile-${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});
```

#### إضافة نشاط مع شهادة

```
POST /api/activities
- المصادقة: مطلوبة
- نوع الملف: PDF, DOC, DOCX, JPG, PNG, ZIP
- الحد الأقصى: 10MB
- حقل الملف: certificate
```

### 3.2 نقاط النهاية للتحديث

```
PATCH /api/profile
- profileImageUrl: رابط الصورة (اختياري)
```

---

## القسم الرابع: تحليل الواجهات الحالية

### 4.1 صفحة الملف الشخصي (profile.tsx)

**الحالة الحالية:**
- ✅ عرض الصورة الرمزية (Avatar)
- ❌ لا توجد وظيفة رفع صورة
- ❌ لا توجد معاينة للصورة
- ❌ لا يوجد خيار تغيير الصورة

**المكونات المستخدمة:**
```tsx
<Avatar className="h-16 w-16">
  <AvatarImage src={user?.profileImageUrl || undefined} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

### 4.2 صفحة السيرة الذاتية (cv-generator.tsx)

**الحالة الحالية:**
- ✅ عرض الصورة الشخصية
- ✅ وظيفة رفع الصورة
- ✅ معاينة الصورة قبل الرفع
- ✅ حفظ الصورة في الملف الشخصي
- ✅ توليد PDF و Word

**كود الرفع:**
```tsx
const uploadImageMutation = useMutation({
  mutationFn: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/upload/profile-image", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    return response.json();
  },
});
```

### 4.3 صفحة الأنشطة (activities.tsx)

**الحالة الحالية:**
- ✅ عرض قائمة الأنشطة
- ✅ عرض حالة النشاط (معتمد/مرفوض/قيد المراجعة)
- ❌ لا توجد صور للنشاط
- ❌ لا توجد صورة للشهادة

### 4.4 صفحة إضافة نشاط (add-activity.tsx)

**الحالة الحالية:**
- ✅ نموذج إضافة النشاط
- ✅ رفع ملف الشهادة
- ❌ لا توجد معاينة للشهادة المرفوعة

### 4.5 صفحة الدورات (courses.tsx)

**الحالة الحالية:**
- ✅ عرض قائمة الدورات
- ✅ عرض الفئة والمدة
- ❌ لا توجد صورة للدورة (يستخدم تدرج لوني بديل)
- ❌ حقل imageUrl موجود في قاعدة البيانات لكنه غير مستخدم

**الصورة الحالية:**
```tsx
<div className="h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-t-lg flex items-center justify-center">
  <BookOpen className="h-10 w-10 text-primary/50" />
</div>
```

### 4.6 صفحة الشهادات (certificates.tsx)

**الحالة الحالية:**
- ✅ عرض قائمة الشهادات
- ✅ عرض تفاصيل الشهادة
- ✅ زر التحقق
- ❌ لا توجد صورة للشهادة

### 4.7 صفحة السجل المهاري (skill-record.tsx)

**الحالة الحالية:**
- ✅ عرض ملخص السجل
- ✅ عرض الأنشطة المعتمدة
- ✅ عرض الدورات المكتملة
- ✅ عرض الختم الإلكتروني (college stamp)
- ✅ رمز QR للتحقق

---

## القسم الخامس: المتطلبات المطلوبة لإضافة الصور

### 5.1 صورة الملف الشخصي

#### الواجهات المطلوب تحديثها:

1. **صفحة الملف الشخصي (profile.tsx)**
   - إضافة زر رفع الصورة
   - إضافة معاينة للصورة
   - إضافة خيار إزالة/تغيير الصورة

2. **صفحة الملف الشخصي للمدرب (trainer-dashboard.tsx)**
   - عرض صورة المدرب
   - رفع صورة الملف الشخصي

3. **صفحة الملف الشخصي للمشرف (supervisor-dashboard.tsx)**
   - عرض صورة المشرف
   - رفع صورة الملف الشخصي

#### المتطلبات التقنية:

```typescript
interface ImageUploadRequirements {
  maxSize: number; // 5MB
  allowedTypes: string[]; // ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  allowedExtensions: string[]; // ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  dimension: {
    min: number; // 100px
    max: number; // 2000px
    aspectRatio: number; // 1:1 for profile
  };
  compression: boolean; // compress before upload
}
```

### 5.2 صور الأنشطة

#### الواجهات المطلوب تحديثها:

1. **صفحة الأنشطة (activities.tsx)**
   - عرض صورة النشاط/الشهادة
   - تكبير الصورة عند النقر

2. **صفحة إضافة نشاط (add-activity.tsx)**
   - إضافة معاينة للشهادة المرفوعة
   - دعم صور إضافية كإثبات

3. **صفحة تفاصيل النشاط**
   - عرض صورة الشهادة بحجم كامل

### 5.3 صور الدورات

#### الواجهات المطلوب تحديثها:

1. **صفحة الدورات (courses.tsx)**
   - عرض صورة الدورة
   - إضافة خيار رفع صورة في صفحة إنشاء الدورة

2. **صفحة تفاصيل الدورة (course-player.tsx)**
   - عرض صورة الدورة في顶部

3. **صفحة إدارة الدورات (للمدربين)**
   - رفع وتعديل صورة الدورة

### 5.4 صور الشهادات

#### الواجهات المطلوب تحديثها:

1. **صفحة الشهادات (certificates.tsx)**
   - عرض شهادة مصغرة

2. **معاينة الشهادة (certificate-view.tsx)**
   - إضافة صورة الختم
   - إضافة الشعار

---

## القسم السادس: خطة التنفيذ

### 6.1 المرحلة الأولى: البنية التحتية

#### 6.1.1 إضافة مجال للصور في قاعدة البيانات

```typescript
// في schema-sqlite.ts

// تحديث جدول الأنشطة لإضافة صور متعددة
export const activityImages = sqliteTable("activity_images", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  activityId: text("activity_id").notNull().references(() => activities.id),
  url: text("url").notNull(),
  type: text("type").notNull().default("certificate"), // certificate, proof, other
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// تحديث جدول الدورات
export const courses = sqliteTable("courses", {
  // ... الحقول الموجودة
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"), // صورة مصغرة
});

// إضافة جدول صور الدورات
export const courseImages = sqliteTable("course_images", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").notNull().references(() => courses.id),
  url: text("url").notNull(),
  isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
```

#### 6.1.2 إضافة نقاط النهاية API

```typescript
// رفع صورة عامة
app.post("/api/upload/image", isAuthenticated, upload.single("file"), async (req: any, res) => {
  // معالجة الرفع
});

// حذف صورة
app.delete("/api/upload/:filename", isAuthenticated, async (req: any, res) => {
  // حذف الملف
});

// تحديث صورة الدورة
app.patch("/api/courses/:id/image", isAuthenticated, upload.single("image"), async (req: any, res) => {
  // تحديث صورة الدورة
});
```

### 6.2 المرحلة الثانية: الواجهات

#### 6.2.1 مكون ImageUploader المشترك

```tsx
interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  maxSize?: number;
  aspectRatio?: "square" | "video" | "any";
  placeholder?: React.ReactNode;
  className?: string;
}
```

#### 6.2.2 تحديث صفحة الملف الشخصي

```tsx
// إضافة في profile.tsx
<div className="flex items-center gap-4">
  <div className="relative">
    <Avatar className="h-24 w-24">
      <AvatarImage src={profile?.profileImageUrl} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
    <Button 
      variant="secondary" 
      size="icon" 
      className="absolute bottom-0 right-0 rounded-full"
      onClick={() => fileInputRef.current?.click()}
    >
      <Camera className="h-4 w-4" />
    </Button>
  </div>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
    className="hidden"
  />
</div>
```

#### 6.2.3 تحديث صفحة الدورات

```tsx
// في صفحة إنشاء الدورة
<FormField
  control={form.control}
  name="imageUrl"
  render={({ field }) => (
    <FormItem>
      <FormLabel>صورة الدورة</FormLabel>
      <ImageUploader
        value={field.value}
        onChange={field.onChange}
        aspectRatio="video"
      />
    </FormItem>
  )}
/>
```

---

## القسم السابع: التوصيات

### 7.1 توصيات فنية

1. **استخدام CDN للصور**: يفضل استخدام خدمة مثل Cloudinary أو AWS S3 لتحسين أداء تحميل الصور.

2. **ضغط الصور**: ضغط الصور قبل الرفع لتقليل حجمها.

3. **إنشاء صور مصغرة**: إنشاء نسخة مصغرة لكل صورة للعرض في القوائم.

4. **التحقق من نوع الملف**: التأكد من نوع الملف على客户端 و الخادم.

5. **تخزين الملفات في التخزين السحابي**: لل部署 الإنتاج، يفضل استخدام Firebase Storage أو AWS S3.

### 7.2 توصيات UX

1. **المعاينة الفورية**: عرض الصورة قبل الرفع.

2. **التقدم**: إظهار شريط تقدم أثناء الرفع.

3. **البديل**: عرض صورة افتراضية في حالة عدم وجود صورة.

4. **التكبير**: إتاحة تكبير الصور عند النقر.

5. **التخزين المؤقت**: استخدام التخزين المؤقت للصور.

---

## القسم الثامن: الخلاصة

### 8.1 ملخص المتطلبات

| الواجهة | الصورة المطلوبة | الأولوية |
|---------|----------------|----------|
| الملف الشخصي | صورة المستخدم | عالية |
| الدورات | صورة الغلاف | متوسطة |
| الأنشطة | صورة الشهادة | منخفضة |
| الشهادات | الختم والشعار | منخفضة |

### 8.2 الخطوات التالية

1. تحديث قاعدة البيانات لإضافة حقول الصور الجديدة
2. إضافة نقاط النهاية API للرفع والحذف
3. إنشاء مكون ImageUploader مشترك
4. تحديث صفحات الواجهة واحداً تلو الآخر
5. اختبار الوظائف بشكل شامل
6. تحسين الأداء والأمان

---

## الملاحق

### أ. قائمة الملفات المطلوب تعديلها

1. `shared/schema-sqlite.ts` - إضافة حقول جديدة
2. `server/storage.ts` - إضافة دوال للتعامل مع الصور
3. `server/routes.ts` - إضافة نقاط النهاية
4. `client/src/pages/profile.tsx` - إضافة رفع الصورة
5. `client/src/pages/courses.tsx` - عرض صور الدورات
6. `client/src/pages/add-activity.tsx` - معاينة الشهادة
7. `client/src/pages/activities.tsx` - عرض صور الأنشطة
8. `client/src/components/certificate-view.tsx` - إضافة الختم

### ب. قائمة الحقول المطلوب إضافتها

```typescript
// studentProfiles
profileImageUrl: string;

// courses  
imageUrl: string;
thumbnailUrl: string;

// activities
certificateUrl: string; // موجود
proofUrl: string; // موجود
images: string[]; // صور إضافية
```

### ج. قائمة الأيقونات المطلوبة

- Camera (للرفع)
- Image (للعرض)
- Upload (للرفع)
- X (للإزالة)
- Eye (للمعاينة)
- D
ownload (للتحميل)

---

**تاريخ التقرير:** 2024
**إصدار المشروع:** 1.0
**حالة التوثيق:** نشط

