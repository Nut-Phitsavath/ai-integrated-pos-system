# Turso Cloud Database - Quick Start

## 1. Sign Up for Turso

Run this command (it will open your browser):
```bash
turso auth signup
```

Sign in with GitHub (recommended) or email.

---

## 2. Create Your Cloud Database

```bash
turso db create smart-pos
```

---

## 3. Get Connection Details

**Get the URL:**
```bash
turso db show smart-pos --url
```

**Get the auth token:**
```bash
turso db tokens create smart-pos
```

---

## 4. Update .env File

Open `.env` and replace the DATABASE_URL with:
```
DATABASE_URL="libsql://[YOUR-URL-FROM-STEP-3]?authToken=[YOUR-TOKEN-FROM-STEP-3]"
```

**Example:**
```
DATABASE_URL="libsql://smart-pos-john.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR..."
```

---

## 5. Generate Prisma Client

```bash
npx prisma generate
```

✅ This should work now (using cloud database)!

---

## 6. Create Database Tables

```bash
npx prisma db push
```

---

## 7. Seed the Database

```bash
npx prisma db seed
```

---

## 8. Start the App

```bash
npm run dev
```

Open http://localhost:3000 and login:
- **Username:** officer1  
- **Password:** password123

---

## View Your Cloud Database

```bash
turso db shell smart-pos
```

Or visit https://turso.tech/app

---

**Ready? Start with Step 1: `turso auth signup`**
