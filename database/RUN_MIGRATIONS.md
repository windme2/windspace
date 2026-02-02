# 🚀 วิธีรัน Database Migrations

## ขั้นตอนการรัน SQL บน Supabase

### วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ) ⭐

1. **เปิด Supabase Dashboard**
   - ไปที่: https://supabase.com/dashboard
   - เข้าสู่ระบบและเลือกโปรเจกต์ `windspace`

2. **เปิด SQL Editor**
   - คลิกเมนู **SQL Editor** ทางซ้ายมือ
   - คลิกปุ่ม **New query**

3. **รัน Migration Files ตามลำดับ**
   
   **ก. รัน Comments Table:**
   - เปิดไฟล์ `migrations/006_add_comments_table.sql`
   - คัดลอกโค้ดทั้งหมด
   - วางใน SQL Editor
   - คลิก **Run** หรือกด `Ctrl + Enter`
   - รอจนขึ้น "Success. No rows returned"

   **ข. รัน Newsletter Subscribers Table:**
   - เปิดไฟล์ `migrations/007_add_newsletter_subscribers_table.sql`
   - คัดลอกโค้ดทั้งหมด
   - วางใน SQL Editor (query ใหม่)
   - คลิก **Run**
   - รอจนขึ้น "Success. No rows returned"

   **ค. รัน Authors Table:**
   - เปิดไฟล์ `migrations/008_add_authors_table.sql`
   - คัดลอกโค้ดทั้งหมด
   - วางใน SQL Editor (query ใหม่)
   - คลิก **Run**
   - รอจนขึ้น "Success. 4 rows returned" (4 authors ถูกเพิ่มเข้าไป)

4. **ตรวจสอบผลลัพธ์**
   - คลิกเมนู **Table Editor** ทางซ้าย
   - ควรเห็น tables ใหม่:
     - ✅ `comments`
     - ✅ `newsletter_subscribers`
     - ✅ `authors`
   - คลิกดู `authors` table จะเห็นข้อมูล 4 authors
   - คลิกดู `articles` table จะเห็น column ใหม่: `author_id`

---

### วิธีที่ 2: ใช้ PowerShell (สำหรับคนชอบ CLI) 💻

1. **เปิด PowerShell**

2. **ตั้งค่า Environment Variables**
   ```powershell
   $SUPABASE_URL = "https://agumtffdluaznyzioqgr.supabase.co"
   $SERVICE_KEY = "YOUR_SERVICE_ROLE_KEY_HERE"  # ดูจาก .env
   ```

3. **รัน Migration แต่ละไฟล์**
   ```powershell
   # อ่านไฟล์ SQL
   $sql = Get-Content "database/migrations/006_add_comments_table.sql" -Raw
   
   # รัน SQL via REST API
   $headers = @{
       "apikey" = $SERVICE_KEY
       "Authorization" = "Bearer $SERVICE_KEY"
       "Content-Type" = "application/json"
   }
   
   Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body (@{"query"=$sql} | ConvertTo-Json)
   ```

---

## 📊 ตรวจสอบว่าสำเร็จหรือไม่

### ตรวจสอบด้วย PowerShell:

```powershell
# ตรวจสอบ comments table
$headers = @{"apikey"="YOUR_ANON_KEY_HERE"}
Invoke-WebRequest -Uri "https://agumtffdluaznyzioqgr.supabase.co/rest/v1/comments?select=*&limit=1" -Headers $headers | Select-Object -Expand Content

# ตรวจสอบ newsletter_subscribers table
Invoke-WebRequest -Uri "https://agumtffdluaznyzioqgr.supabase.co/rest/v1/newsletter_subscribers?select=*&limit=1" -Headers $headers | Select-Object -Expand Content

# ตรวจสอบ authors table
Invoke-WebRequest -Uri "https://agumtffdluaznyzioqgr.supabase.co/rest/v1/authors?select=*" -Headers $headers | Select-Object -Expand Content
```

ถ้าไม่มี error แสดงว่าสำเร็จ! 🎉

---

## 🔄 อัพเดท Articles ให้มี Author

หลังจากรัน migrations เสร็จแล้ว สามารถเพิ่ม author ให้กับ articles ที่มีอยู่:

```sql
-- อัพเดท articles ให้มี author (ตัวอย่าง)
UPDATE articles SET author_id = 1 WHERE category_id = 4;  -- Technology -> วีรวัฒน์
UPDATE articles SET author_id = 2 WHERE category_id = 1;  -- Food -> นภัส
UPDATE articles SET author_id = 3 WHERE category_id = 2;  -- Travel -> สมชาย
UPDATE articles SET author_id = 4 WHERE category_id = 3;  -- Lifestyle -> พิมพ์ชนก
```

---

## ⚠️ หมายเหตุ

- **RLS Policies**: ตั้งค่า Row Level Security แล้ว
  - Comments: ทุกคนอ่านได้แต่เฉพาะที่ approved, เขียนได้ (จะเป็น pending)
  - Newsletter: ทุกคนสมัครได้, admin อ่านรายชื่อได้
  - Authors: ทุกคนอ่านได้, admin แก้ไขได้

- **Triggers**: มีการอัพเดท `updated_at` อัติโนมัติ
- **Functions**: มีฟังก์ชันนับจำนวน articles ของแต่ละ author อัติโนมัติ

---

## 🐛 แก้ปัญหา

**ถ้า migration ล้มเหลว:**
1. ตรวจสอบว่ามี table อยู่แล้วหรือไม่
2. ลอง DROP table และรันใหม่:
   ```sql
   DROP TABLE IF EXISTS comments CASCADE;
   DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
   DROP TABLE IF EXISTS authors CASCADE;
   ```
3. รัน migration อีกครั้ง

**ถ้า RLS Policy ขัดแย้ง:**
```sql
-- ลบ policies เดิม
DROP POLICY IF EXISTS "policy_name" ON table_name;
```
