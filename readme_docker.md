# 🐳 LostBuddy – Face Search System (Docker Edition)

LostBuddy is a face recognition & search system built using **FastAPI**, **InsightFace**, **PostgreSQL**, and **Qdrant**.

⚠️ This project is **fully Dockerized**, so you **DO NOT need**:

- Python
- PostgreSQL
- Qdrant
- Virtual environments

Docker will handle **everything automatically**.

---

## 👤 Who is this for?

This guide is written for:

- People who **don’t know Docker**
- People who **don’t want to install dependencies**
- People who just want the project to **RUN**

If you can click buttons and run 1 command — you’re good.

---

## 🧱 What’s Inside?

- 🧠 Face Recognition (InsightFace + ONNX)
- 🔍 Face Search using embeddings (Qdrant)
- 🗄️ Metadata storage (PostgreSQL)
- 🌐 REST API (FastAPI)
- 🐳 Docker for easy setup

---

## 🖥️ System Requirements

- Windows / macOS / Linux
- Internet connection (first run downloads models)
- **Docker Desktop**

---

## 🔽 STEP 1: Install Docker Desktop

### 👉 Download Docker:

https://www.docker.com/products/docker-desktop/

### 👉 Install it like a normal app

After installation:

- **Open Docker Desktop**
- Wait until it says **“Docker is running”** ✅

⚠️ IMPORTANT:  
Docker **must be running** before moving to the next step.

---

## 📦 STEP 2: Get the Project Files

You should receive a folder named:

```
final_budddy
```

⚠️ DO NOT change folder names  
⚠️ DO NOT delete anything inside

---

## ▶️ STEP 3: Run the Project (ONLY ONE COMMAND)

### 📍 Open Terminal / Command Prompt

Navigate into the project folder:

```bash
cd final_budddy
```

### 🚀 Start everything:

```bash
docker-compose up
```

That’s it.

---

## ⏳ FIRST RUN WARNING (IMPORTANT)

On the **first run**, Docker will:

- Download Python image
- Download PostgreSQL
- Download Qdrant
- Download ML face models (~100MB)

⏱️ This can take **5–10 minutes**  
💡 This is **normal**, do NOT stop it.

You’ll see logs scrolling — just wait.

---

## ✅ When is it READY?

When you see something like:

```
Uvicorn running on http://0.0.0.0:8000
```

🎉 The system is LIVE.

---

## 🌐 STEP 4: Open in Browser

### 🔹 API Documentation (Swagger UI)

```
http://localhost:8000/docs
```

### 🔹 Health Check

```
http://localhost:8000/
```

Expected response:

```json
{ "status": "LostBuddy API running 🚀" }
```

### 🔹 Qdrant Dashboard

```
http://localhost:6333/dashboard
```

---

## 🖼️ Images & Uploads

Uploaded images are available at:

```
http://localhost:8000/uploads/<image_name>
```

Example:

```
http://localhost:8000/uploads/person1.jpg
```

---

## 🛑 How to STOP the Project

When you’re done, press:

```
CTRL + C
```

Then run:

```bash
docker-compose down
```

⚠️ This **stops** containers but keeps data safe.

---

## ❌ DO NOT RUN THIS (IMPORTANT)

```bash
docker-compose down -v
```

🚨 This will **DELETE databases and embeddings**

---

## 🔁 How to Restart Later

Anytime you want to start again:

```bash
cd final_budddy
docker-compose up
```

No setup again. Everything is saved.

---

## 🧠 Common Questions

### ❓ Do I need Python installed?

❌ No

### ❓ Do I need PostgreSQL?

❌ No

### ❓ Do I need Qdrant?

❌ No

### ❓ Can I break my system?

❌ No — Docker is isolated

---

## 🧯 Troubleshooting

### If Docker command fails:

- Make sure **Docker Desktop is running**
- Restart Docker Desktop
- Try again

### If ports don’t open:

- Close apps using ports `8000`, `5432`, `6333`
- Restart Docker

---

## 🏁 Summary (TL;DR)

1️⃣ Install Docker Desktop  
2️⃣ Open Terminal  
3️⃣ Run:

```bash
docker-compose up
```

4️⃣ Open:

```
http://localhost:8000/docs
```

🎉 Done.

---

## ❤️ Built For

Lost & Missing Person Identification  
Project Name: **LostBuddy**
