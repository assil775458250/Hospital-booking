# توثيق واجهة برمجة التطبيقات (API Documentation) - مجمع يسر الطبي 🏥
> **دليل مخصص لفريق تطوير الواجهات الأمامية (Frontend Team)**  
> يغطي هذا المستند كافة الـ Endpoints المصنفة بدقة، موضحاً المسارات، المعاملات (Parameters)، أنواع البيانات (Types)، الصلاحيات، ونماذج الطلب والاستجابة بصيغة JSON.

---

## 📑 فهرس المحتويات
1. [إرشادات عامة وإعدادات الاتصال (General Guidelines)](#-إرشادات-عامة-وإعدادات-الاتصال)
2. [هيكل الاستجابات (Response Structure)](#-هيكل-الاستجابات-response-structure)
3. [1. المصادقة وإدارة الحساب (Authentication & Profile)](#1-المصادقة-وإدارة-الحساب-authentication--profile)
4. [2. إدارة المستخدمين (Users Management)](#2-إدارة-المستخدمين-users-management)
5. [3. الأطباء والجدولة (Doctors & Schedule)](#3-الأطباء-والجدولة-doctors--schedule)
6. [4. المرضى (Patients)](#4-المرضى-patients)
7. [5. العيادات والتخصصات (Specializations & Clinics)](#5-العيادات-والتخصصات-specializations--clinics)
8. [6. الفترات الزمنية والمواعيد المتاحة (Slots Management)](#6-الفترات-الزمنية-والمواعيد-المتاحة-slots-management)
9. [7. الحجوزات والمواعيد (Appointments & Bookings)](#7-الحجوزات-والمواعيد-appointments--bookings)
10. [8. لوحة تحكم المسؤول (Admin Dashboard & Management)](#8-لوحة-تحكم-المسؤول-admin-dashboard--management)

---

## 🌐 إرشادات عامة وإعدادات الاتصال

* **Base URL للتطوير:** `https://localhost:7146` أو `http://localhost:5169` (راجع `launchSettings.json`).
* **نوع المحتوى:** `Content-Type: application/json`
* **المصادقة (JWT Bearer Token):**
  يجب إرسال التوكن في جميع الطلبات المحمية ضمن الـ Headers بالشكل التالي:
  ```http
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```
* **صيغ التواريخ والأوقات:**
  * التواريخ الكاملة والأوقات: `ISO 8601` بصيغة UTC (مثل: `"2026-11-05T09:30:00Z"`).
  * حقول الأوقات اليومية: نص بصيغة 24 ساعة (مثل: `"09:30"`, `"14:00"`).
  * حقول التواريخ اليومية: نص بصيغة (مثل: `"2026-11-05"`).

---

## 📦 هيكل الاستجابات (Response Structure)

يعتمد السيرفر على تغليف موحد عبر `HandleResult`:

### في حال النجاح (Success - `200 OK` أو `201 Created`):
يتم إرجاع البيانات المطلوبة مباشرة (Object أو Array):
```json
{
  "id": 1,
  "fullName": "أحمد عبدالله",
  "email": "doctor@hospital.com"
}
```

### في حال الفشل أو الخطأ (Error - `400`, `401`, `403`, `404`, `500`):
يتم إرجاع كائن يحتوي على رسالة الخطأ لتسهيل عرضها للمستخدم عبر Toast أو Alert:
```json
{
  "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة"
}
```

---

## 1. المصادقة وإدارة الحساب (Authentication & Profile)
**المسار الأساسي:** `/api/auth`

### 1.1 تسجيل حساب جديد (Register)
* **المسار:** `POST /api/auth/register`
* **الصلاحية:** عام (Public)
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | القيود والشروط (Validation) |
| :--- | :--- | :--- | :--- |
| `fullName` | `string` | **نعم** | الاسم الكامل |
| `phoneNumber` | `string` | **نعم** | رقم الهاتف (فريد) |
| `email` | `string` | **نعم** | بريد إلكتروني صالح (فريد) |
| `password` | `string` | **نعم** | كلمة المرور |
| `confirmPassword` | `string` | **نعم** | يجب أن تطابق `password` |
| `agreeToTerms` | `boolean` | **نعم** | يجب أن تكون `true` حصراً |

* **مثال الطلب (Request Example):**
```json
{
  "fullName": "محمد علي سالم",
  "phoneNumber": "0502223344",
  "email": "mohammed@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "agreeToTerms": true
}
```

* **الاستجابة الناجحة (`201 Created`):**
```json
{
  "userId": 5,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "تم التسجيل بنجاح",
  "role": "Patient",
  "user": {
    "id": 5,
    "fullName": "محمد علي سالم",
    "email": "mohammed@example.com",
    "phoneNumber": "0502223344",
    "role": "Patient",
    "accountStatus": "Active",
    "createdAt": "2026-11-04T12:00:00Z"
  }
}
```

---

### 1.2 تسجيل الدخول (Login)
* **المسار:** `POST /api/auth/login`
* **الصلاحية:** عام (Public)
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | الوصف |
| :--- | :--- | :--- | :--- |
| `emailOrPhone` | `string` | **نعم** | البريد الإلكتروني أو رقم الهاتف |
| `password` | `string` | **نعم** | كلمة المرور |

* **مثال الطلب:**
```json
{
  "emailOrPhone": "mohammed@example.com",
  "password": "Password@123"
}
```

* **الاستجابة الناجحة (`200 OK`):**
```json
{
  "userId": 5,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "تم تسجيل الدخول بنجاح",
  "role": "Patient",
  "user": {
    "id": 5,
    "fullName": "محمد علي سالم",
    "email": "mohammed@example.com",
    "phoneNumber": "0502223344",
    "role": "Patient",
    "accountStatus": "Active",
    "createdAt": "2026-11-04T12:00:00Z"
  }
}
```

---

### 1.3 جلب بيانات المستخدم الحالي (Get Current User Profile)
* **المسار:** `GET /api/auth/me`
* **الصلاحية:** مسجل دخول (Bearer Token)
* **المعاملات:** لا توجد (يتم استخراج الهوية من الـ Token تلقائياً).
* **الاستجابة الناجحة (`200 OK`):**
```json
{
  "id": 5,
  "fullName": "محمد علي سالم",
  "email": "mohammed@example.com",
  "phoneNumber": "0502223344",
  "role": "Patient",
  "accountStatus": "Active",
  "createdAt": "2026-11-04T12:00:00Z"
}
```

---

## 2. إدارة المستخدمين (Users Management)
**المسار الأساسي:** `/api/users`

### 2.1 جلب بيانات مستخدم حسب المعرف (Get User by ID)
* **المسار:** `GET /api/users/{id}`
* **الصلاحية:** مسجل دخول (صاحب الحساب نفسه أو مسؤول `Admin`)
* **المعاملات (Route Parameter):**
  * `id` (`integer`, إلزامي): معرف المستخدم.
* **الاستجابة الناجحة (`200 OK`):** يرجع كائن `UserDto`.

---

### 2.2 تعديل بيانات المستخدم (Update User)
* **المسار:** `PUT /api/users/{id}`
* **الصلاحية:** مسجل دخول (صاحب الحساب نفسه أو `Admin`)
* **المعاملات (Route Parameter):**
  * `id` (`integer`, إلزامي): معرف المستخدم.
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | الوصف |
| :--- | :--- | :--- | :--- |
| `fullName` | `string` | اختياري | الاسم الجديد |
| `phoneNumber` | `string` | اختياري | رقم الهاتف الجديد |
| `email` | `string` | اختياري | البريد الإلكتروني الجديد |

* **مثال الطلب:**
```json
{
  "fullName": "محمد علي السالم",
  "phoneNumber": "0509998877",
  "email": "m.salem@example.com"
}
```

---

### 2.3 تغيير كلمة المرور (Change Password)
* **المسار:** `PUT /api/users/{id}/password`
* **الصلاحية:** مسجل دخول (صاحب الحساب نفسه أو `Admin`)
* **المعاملات (Route Parameter):**
  * `id` (`integer`, إلزامي): معرف المستخدم.
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | الوصف |
| :--- | :--- | :--- | :--- |
| `currentPassword` | `string` | **نعم** | كلمة المرور الحالية للتأكيد |
| `newPassword` | `string` | **نعم** | كلمة المرور الجديدة (6 أحرف على الأقل) |

* **مثال الطلب:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@2026"
}
```

---

### 2.4 حذف / تعطيل مستخدم (Delete User)
* **المسار:** `DELETE /api/users/{id}`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).
* **الاستجابة:** `200 OK` مع رسالة تأكيد الحذف/التعطيل.

---

## 3. الأطباء والجدولة (Doctors & Schedule)
**المسار الأساسي:** `/api/doctors`

### 3.1 عرض قائمة الأطباء (List Doctors)
* **المسار:** `GET /api/doctors`
* **الصلاحية:** عام (Public)
* **معاملات التصفية (Query Parameters):**

| المعامل (Param) | النوع (Type) | إلزامي؟ | الوصف |
| :--- | :--- | :--- | :--- |
| `specializationId`| `integer` | اختياري | تصفية حسب معرف التخصص/العيادة |
| `search` | `string` | اختياري | بحث بالاسم أو البريد |

* **الاستجابة الناجحة (`200 OK`):** قائمة من كائنات الأطباء:
```json
[
  {
    "id": 1,
    "userId": 2,
    "fullName": "د. أحمد عبدالله",
    "email": "doctor@hospital.com",
    "phoneNumber": "0501111111",
    "specializationId": 1,
    "specializationName": "عيادة القلب",
    "clinic": "عيادة القلب",
    "bio": "استشاري أمراض القلب والقسطرة التداخلية",
    "experience": "10 سنوات",
    "rating": 4.9,
    "availabilityStatus": "Available",
    "profileImageUrl": "/images/doctors/dr-ahmed.png",
    "accountStatus": "Active",
    "appointmentsCount": 15
  }
]
```

---

### 3.2 تفاصيل الطبيب مع مواعيده المتاحة (Doctor Details & Slots)
* **المسار:** `GET /api/doctors/{id}`
* **الصلاحية:** عام (Public)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).
* **الاستجابة الناجحة (`200 OK`):**
```json
{
  "id": 1,
  "userId": 2,
  "fullName": "د. أحمد عبدالله",
  "email": "doctor@hospital.com",
  "phoneNumber": "0501111111",
  "specializationId": 1,
  "specializationName": "عيادة القلب",
  "clinic": "عيادة القلب",
  "bio": "استشاري أمراض القلب",
  "experience": "10 سنوات",
  "rating": 4.9,
  "availabilityStatus": "Available",
  "profileImageUrl": "/images/doctors/dr-ahmed.png",
  "accountStatus": "Active",
  "appointmentsCount": 15,
  "scheduleSlots": [
    {
      "id": 10,
      "doctorId": 1,
      "date": "2026-11-05T00:00:00",
      "startTime": "09:00",
      "endTime": "09:30",
      "status": "Available"
    }
  ]
}
```

---

### 3.3 إضافة طبيب جديد (Create Doctor)
* **المسار:** `POST /api/doctors`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | القيمة الافتراضية / الوصف |
| :--- | :--- | :--- | :--- |
| `fullName` | `string` | **نعم** | اسم الطبيب |
| `phoneNumber` | `string` | **نعم** | رقم الهاتف |
| `email` | `string` | **نعم** | بريد إلكتروني صالح |
| `password` | `string` | اختياري | افتراضياً: `"Doctor@123"` |
| `specializationId`| `integer` | **نعم** | معرف التخصص/العيادة المرتبطة |
| `status` | `string` | اختياري | افتراضياً: `"Active"` |
| `bio` | `string` | اختياري | نبذة عن الطبيب |
| `clinic` | `string` | اختياري | اسم العيادة |
| `experience` | `string` | اختياري | سنوات الخبرة (مثل `"8 سنوات"`) |
| `profileImageUrl` | `string` | اختياري | رابط صورة الملف الشخصي |

* **الاستجابة الناجحة (`201 Created`):** كائن `DoctorDto`.

---

### 3.4 تعديل بيانات طبيب (Update Doctor)
* **المسار:** `PUT /api/doctors/{id}`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).
* **المدخلات:** كائن يحتوي على الحقول المراد تعديلها فقط (جميع حقول `UpdateDoctorDto` اختيارية).

---

### 3.5 حذف طبيب (Delete Doctor)
* **المسار:** `DELETE /api/doctors/{id}`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).

---

### 3.6 جلب المواعيد المتاحة لطبيب معين (Get Doctor Slots)
* **المسار:** `GET /api/doctors/{doctorId}/slots`
* **الصلاحية:** عام (Public)
* **المعاملات:**
  * `doctorId` (`integer`, إلزامي في المسار): معرف الطبيب.
  * `date` (`string / date`, اختياري في الـ Query): تاريخ اليوم بصيغة `YYYY-MM-DD`.
* **الاستجابة الناجحة (`200 OK`):** قائمة من كائنات `DoctorSlotDto`:
```json
[
  {
    "id": 12,
    "doctorId": 1,
    "date": "2026-11-05T00:00:00",
    "startTime": "10:00",
    "endTime": "10:30",
    "status": "Available"
  }
]
```

---

### 3.7 إنشاء موعد متاح لطبيب (Create Doctor Slot)
* **المسار:** `POST /api/doctors/{doctorId}/slots`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **المعاملات (Route):** `doctorId` (`integer`, إلزامي).
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | مثال / الوصف |
| :--- | :--- | :--- | :--- |
| `date` | `string (date)` | **نعم** | `"2026-11-05"` |
| `startTime` | `string` | **نعم** | `"11:00"` |
| `endTime` | `string` | **نعم** | `"11:30"` |
| `status` | `string` | اختياري | افتراضياً: `"Available"` |

---

### 3.8 عرض مواعيد وحجوزات الطبيب (Get Doctor Appointments)
* **المسار:** `GET /api/doctors/{doctorId}/appointments`
* **الصلاحية:** الطبيب نفسه أو المسؤول (`Doctor`, `Admin`)
* **معاملات التصفية (Query Parameters):**
  * `period` (`string`, اختياري): مثل `"today"`, `"week"`, `"month"`.
  * `status` (`string`, اختياري): تصفية حسب حالة الحجز (`"Pending"`, `"Approved"`, `"Cancelled"`, إلخ).

---

## 4. المرضى (Patients)
**المسار الأساسي:** `/api/patients`

### 4.1 عرض جميع المرضى (List Patients)
* **المسار:** `GET /api/patients`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **الاستجابة:** قائمة ببيانات المرضى (`PatientDto[]`).

---

### 4.2 تفاصيل المريض وإحصائياته وسجل حجوزاته (Get Patient Details)
* **المسار:** `GET /api/patients/{id}`
* **الصلاحية:** المريض نفسه أو المسؤول (`Admin`)
* **الاستجابة الناجحة (`200 OK`):**
```json
{
  "id": 1,
  "userId": 5,
  "fullName": "محمد علي سالم",
  "email": "patient@hospital.com",
  "phoneNumber": "0502222222",
  "dateOfBirth": "1995-05-15T00:00:00Z",
  "profileImageUrl": null,
  "accountStatus": "Active",
  "createdAt": "2026-11-04T10:00:00Z",
  "statistics": {
    "totalAppointments": 3,
    "upcomingAppointments": 1,
    "completedAppointments": 1,
    "cancelledAppointments": 1
  },
  "appointments": [
    {
      "id": 101,
      "appointmentNumber": "APT-101",
      "doctorName": "د. أحمد عبدالله",
      "clinic": "عيادة القلب",
      "appointmentDate": "2026-11-05T00:00:00Z",
      "startTime": "09:00",
      "endTime": "09:30",
      "status": "Approved"
    }
  ]
}
```

---

### 4.3 تعديل بيانات المريض (Update Patient)
* **المسار:** `PUT /api/patients/{id}`
* **الصلاحية:** المريض نفسه أو المسؤول (`Admin`)
* **المدخلات (Request Body - JSON):** `fullName`, `phoneNumber`, `email`, `dateOfBirth`, `profileImageUrl` (جميعها اختيارية).

---

### 4.4 حذف مريض (Delete Patient)
* **المسار:** `DELETE /api/patients/{id}`
* **الصلاحية:** مسؤول فقط (`Admin`)

---

## 5. العيادات والتخصصات (Specializations & Clinics)
**المسار الأساسي:** `/api/specializations`

### 5.1 عرض جميع التخصصات والعيادات (List Specializations)
* **المسار:** `GET /api/specializations`
* **الصلاحية:** عام (Public)
* **الاستجابة الناجحة (`200 OK`):**
```json
[
  {
    "id": 1,
    "name": "عيادة القلب",
    "icon": "heart-pulse",
    "description": "تشخيص وعلاج أمراض القلب والأوعية الدموية",
    "status": "Active",
    "doctorsCount": 3
  },
  {
    "id": 2,
    "name": "عيادة الأطفال",
    "icon": "baby",
    "description": "رعاية صحية شاملة للأطفال وحديثي الولادة",
    "status": "Active",
    "doctorsCount": 2
  }
]
```

---

### 5.2 تفاصيل تخصص معين (Get Specialization by ID)
* **المسار:** `GET /api/specializations/{id}`
* **الصلاحية:** عام (Public)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).

---

### 5.3 إضافة تخصص/عيادة جديدة (Create Specialization)
* **المسار:** `POST /api/specializations`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | الوصف |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **نعم** | اسم التخصص/العيادة |
| `icon` | `string` | اختياري | أيقونة أو رابط الأيقونة |
| `description` | `string` | اختياري | وصف العيادة والخدمات |
| `status` | `string` | اختياري | افتراضياً: `"Active"` |

---

### 5.4 تعديل تخصص/عيادة (Update Specialization)
* **المسار:** `PUT /api/specializations/{id}`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).
* **المدخلات:** `name`, `icon`, `description`, `status` (اختيارية).

---

### 5.5 حذف تخصص/عيادة (Delete Specialization)
* **المسار:** `DELETE /api/specializations/{id}`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).

---

## 6. الفترات الزمنية والمواعيد المتاحة (Slots Management)
**المسار الأساسي:** `/api/slots`

### 6.1 تعديل موعد متاح (Update Slot)
* **المسار:** `PUT /api/slots/{id}`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | الوصف |
| :--- | :--- | :--- | :--- |
| `date` | `string (date)` | اختياري | التاريخ الجديد |
| `startTime` | `string` | اختياري | وقت البدء (مثل `"10:00"`) |
| `endTime` | `string` | اختياري | وقت الانتهاء (مثل `"10:30"`) |
| `status` | `string` | اختياري | حالة الموعد (`"Available"`, `"Unavailable"`) |

---

### 6.2 حذف موعد متاح (Delete Slot)
* **المسار:** `DELETE /api/slots/{id}`
* **الصلاحية:** مسؤول فقط (`Admin`)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).

---

## 7. الحجوزات والمواعيد (Appointments & Bookings)
**المسار الأساسي:** `/api/appointments`

### 7.1 حجز موعد جديد (Book Appointment)
* **المسار:** `POST /api/appointments`
* **الصلاحية:** مسجل دخول (Patient / Authenticated User)
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | الوصف |
| :--- | :--- | :--- | :--- |
| `doctorId` | `integer` | **نعم** | معرف الطبيب المطلوب الحجز عنده |
| `slotId` | `integer` | **نعم** | معرف الفترة الزمنية المتاحة (SlotId) |
| `notes` | `string` | اختياري | ملاحظات إضافية من المريض |
| `reasonForVisit` | `string` | اختياري | سبب الزيارة / الأعراض |

* **مثال الطلب:**
```json
{
  "doctorId": 1,
  "slotId": 12,
  "notes": "يرجى مراعاة أن المريض يعاني من حساسية البنسلين",
  "reasonForVisit": "فحص دوري لضغط الدم والقلب"
}
```

* **الاستجابة الناجحة (`201 Created`):**
```json
{
  "id": 105,
  "appointmentNumber": "APT-105",
  "patientId": 5,
  "patientName": "محمد علي سالم",
  "patientPhone": "0502222222",
  "doctorId": 1,
  "doctorName": "د. أحمد عبدالله",
  "specializationName": "عيادة القلب",
  "clinic": "عيادة القلب",
  "slotId": 12,
  "appointmentDate": "2026-11-05T00:00:00Z",
  "startTime": "10:00",
  "endTime": "10:30",
  "status": "Pending",
  "notes": "يرجى مراعاة أن المريض يعاني من حساسية البنسلين",
  "reasonForVisit": "فحص دوري لضغط الدم والقلب",
  "createdAt": "2026-11-04T22:00:00Z"
}
```

---

### 7.2 تفاصيل حجز معين (Get Appointment by ID)
* **المسار:** `GET /api/appointments/{id}`
* **الصلاحية:** صاحب الموعد أو المسؤول (`Owner`, `Admin`)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).
* **الاستجابة:** كائن `AppointmentDto`.

---

### 7.3 استعراض مواعيدي (Get My Appointments)
* **المسار:** `GET /api/appointments/my`
* **الصلاحية:** مسجل دخول (Patient أو Doctor)
* **معاملات التصفية (Query Parameters):**
  * `status` (`string`, اختياري): تصفية حسب حالة معينة. في حال عدم إرسال `status`، يتم إرجاع المواعيد مقسمة حسب التصنيف (`Upcoming`, `Past`, `Cancelled`).
* **الاستجابة الناجحة في حالة المجموعات (`200 OK`):**
```json
{
  "upcoming": [
    {
      "id": 105,
      "appointmentNumber": "APT-105",
      "doctorName": "د. أحمد عبدالله",
      "clinic": "عيادة القلب",
      "appointmentDate": "2026-11-05T00:00:00Z",
      "startTime": "10:00",
      "endTime": "10:30",
      "status": "Pending"
    }
  ],
  "past": [],
  "cancelled": []
}
```

---

### 7.4 تغيير حالة الموعد (Update Appointment Status)
* **المسار:** `PUT /api/appointments/{id}/status`
* **الصلاحية:** الطبيب أو المسؤول (`Doctor`, `Admin`)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | القيم المتاحة المقبولة |
| :--- | :--- | :--- | :--- |
| `status` | `string` | **نعم** | `"Pending"`, `"Approved"` (أو `"Confirmed"`), `"Completed"`, `"Cancelled"`, `"Rejected"` |

* **مثال الطلب:**
```json
{
  "status": "Approved"
}
```

---

### 7.5 إلغاء حجز موعد (Cancel Appointment)
* **المسار:** `DELETE /api/appointments/{id}`
* **الصلاحية:** صاحب الموعد أو المسؤول (`Owner`, `Admin`)
* **المعاملات:** `id` (`integer`, إلزامي في المسار).
* **الاستجابة:** `200 OK` مع تحويل حالة الموعد إلى `Cancelled` وإعادة إتاحة الفترة الزمنية (Slot).

---

## 8. لوحة تحكم المسؤول (Admin Dashboard & Management)
**المسار الأساسي:** `/api/admin`  
*(جميع الـ Endpoints في هذا الصنف تتطلب صلاحية مسؤول حصراً `Authorize(Roles = "Admin")`)*

### 8.1 إحصائيات لوحة التحكم (Admin Dashboard Overview)
* **المسار:** `GET /api/admin/dashboard`
* **الاستجابة الناجحة (`200 OK`):**
```json
{
  "totalDoctors": 12,
  "totalPatients": 150,
  "totalSpecializations": 5,
  "totalAppointments": 340,
  "upcomingAppointments": 25,
  "pendingAppointments": 10,
  "confirmedAppointments": 15,
  "completedAppointments": 280,
  "cancelledAppointments": 10,
  "recentAppointments": [
    {
      "id": 105,
      "appointmentNumber": "APT-105",
      "patientName": "محمد علي سالم",
      "doctorName": "د. أحمد عبدالله",
      "status": "Pending",
      "appointmentDate": "2026-11-05T00:00:00Z"
    }
  ]
}
```

---

### 8.2 إدارة المستخدمين والبحث المتقدم (Admin: Get Users)
* **المسار:** `GET /api/admin/users`
* **معاملات التصفية (Query Parameters):**

| المعامل (Param) | النوع (Type) | إلزامي؟ | الوصف |
| :--- | :--- | :--- | :--- |
| `role` | `string` | اختياري | تصفية حسب الدور (`"Admin"`, `"Doctor"`, `"Patient"`) |
| `status` | `string` | اختياري | حالة الحساب (`"Active"`, `"Inactive"`) |
| `search` | `string` | اختياري | بحث بالاسم أو الهاتف أو البريد |

---

### 8.3 تعديل دور المستخدم (Update User Role)
* **المسار:** `PUT /api/admin/users/{id}/role`
* **المعاملات:** `id` (`integer`, إلزامي في المسار).
* **المدخلات (Request Body - JSON):**

| الحقل (Field) | النوع (Type) | إلزامي؟ | القيم المتاحة |
| :--- | :--- | :--- | :--- |
| `role` | `string` | **نعم** | `"Patient"`, `"Doctor"`, `"Admin"` |

* **مثال الطلب:**
```json
{
  "role": "Doctor"
}
```

---

### 8.4 إدارة المواعيد الشاملة للمسؤول (Admin: Get Appointments)
* **المسار:** `GET /api/admin/appointments`
* **معاملات التصفية (Query Parameters):**

| المعامل (Param) | النوع (Type) | إلزامي؟ | الوصف |
| :--- | :--- | :--- | :--- |
| `patientId` | `integer` | اختياري | تصفية حسب مريض معين |
| `doctorId` | `integer` | اختياري | تصفية حسب طبيب معين |
| `status` | `string` | اختياري | تصفية حسب حالة الحجز |
| `date` | `string (date)` | اختياري | تصفية حسب تاريخ اليوم `YYYY-MM-DD` |

---

### 8.5 استعراض الأطباء لإدارة المسؤول (Admin: Get Doctors)
* **المسار:** `GET /api/admin/doctors`
* **معاملات التصفية (Query Parameters):**
  * `specializationId` (`integer`, اختياري)
  * `status` (`string`, اختياري)
  * `search` (`string`, اختياري)

---

### 8.6 استعراض المرضى لإدارة المسؤول (Admin: Get Patients)
* **المسار:** `GET /api/admin/patients`
* **معاملات التصفية (Query Parameters):**
  * `status` (`string`, اختياري)
  * `search` (`string`, اختياري)

---

## 💡 نصائح وحلول سريعة لفريق الـ Frontend

1. **التعامل مع رموز الخطأ:**
   * عند تلقي كود `401 Unauthorized`: يجب تفريغ التوكن من الـ Storage والتحويل لصفحة تسجيل الدخول `login`.
   * عند تلقي كود `403 Forbidden`: تنبيه المستخدم بأن ليس لديه صلاحية كافية للدخول لهذه الصفحة.
   * عند تلقي كود `400 Bad Request`: استخرج رسالة الخطأ من `response.data.message` واعرضها في تنبيه للمستخدم.
2. **الـ CORS:**
   * تم تفعيل سياسة `AllowAll` في بيئة التطوير، بحيث يستطيع تطبيق React/Vue/Angular العمل على منافذ مختلفة مثل `localhost:3000` أو `localhost:5173` دون أي عوائق.
3. **Swagger UI:**
   * يمكنك تجربة جميع الـ Endpoints بشكل تفاعلي ومباشر أثناء تشغيل السيرفر عبر المتصفح على:
     `https://localhost:<port>/swagger`
