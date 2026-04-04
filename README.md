# Node.js Project on AWS EC2 with RDS (MySQL) – Complete DevOps Guide

Deploy a full-stack Node.js + React project on AWS using:

- ⚙️ **EC2** (Ubuntu 22.04) — runs Node.js backend + serves React frontend
- 🗄️ **RDS** (MySQL, Free Tier) — managed database
- 🔌 **Socket.IO** — real-time WebSocket communication
- 🚀 **PM2** — Node.js process manager
- 🔐 **SSH** — secured via `.pem` key

---

## 🏗️ Project Architecture

```
Browser (User)
      ↓  HTTP :3000
EC2 Instance (Ubuntu 22.04)
  ├── server.js  (Express + Socket.IO)
  ├── PM2        (process manager)
  └── /frontend/dist  (React build served statically)
      ↓  MySQL :3306
RDS Instance (MySQL)
  └── cloudflare_socket_test (database)
      └── messages (table)
```

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| AWS EC2 (Ubuntu 22.04) | Hosts Node.js application |
| AWS RDS (MySQL) | Managed database |
| Node.js + Express | Backend server |
| Socket.IO | Real-time WebSocket |
| React + Vite | Frontend UI |
| PM2 | Keep app running 24/7 |
| mysql2 | Node.js MySQL driver |
| dotenv | Environment variable management |

---

## 📁 Project Structure

```
nodejs_project/
└── NodeJS_Socket/
    ├── backend/
    │   ├── server.js       ← Main backend file
    │   ├── .env            ← Environment variables (never push to GitHub)
    │   ├── .env.example    ← Template for other developers
    │   └── package.json
    └── frontend/
        ├── src/
        │   ├── App.jsx     ← React app with Socket.IO client
        │   └── main.jsx
        ├── dist/           ← Built frontend (after npm run build)
        └── package.json
```

---

## 1️⃣ Create AWS EC2 Instance

1. Login to **AWS Console**
2. Go to **EC2 → Instances → Launch Instance**
3. Configure:
   - **Name:** `nodejs-ec2`
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type:** t2.micro (Free tier)
   - **Key pair:** Create/download `.pem` file (e.g., `nodejs-key.pem`)
4. Security Group — allow inbound:
   - SSH — port **22**
   - Custom TCP — port **3000** (Node.js app)
5. Click **Launch Instance**

---

## 2️⃣ Create AWS RDS MySQL Database

1. Go to **RDS → Databases → Create database**
2. Select: **Easy Create → MySQL → Free tier**
3. Configure:
   - **DB identifier:** `nodejs-db`
   - **Master username:** `admin`
   - **Master password:** `YourPassword123`
4. Under **Connectivity:** set security group to allow MySQL (port **3306**) from EC2's security group
5. Click **Create database**
6. Note the **Endpoint** from RDS console (e.g., `nodejs-db.xxxx.us-east-1.rds.amazonaws.com`)

---

## 3️⃣ Configure RDS Security Group

1. Go to **RDS → Your Database → Security Group**
2. Click **Edit Inbound Rules → Add Rule:**

| Type | Port | Source |
|---|---|---|
| MySQL/Aurora | 3306 | EC2 Security Group ID (sg-xxxxxx) |

3. Click **Save Rules**

---

## 4️⃣ SSH into EC2 Instance

```bash
cd ~/Downloads
chmod 400 nodejs-key.pem
ssh -i nodejs-key.pem ubuntu@<EC2-PUBLIC-IP>
```

---

## 5️⃣ Install Node.js and MySQL Client on EC2

```bash
# Update system
sudo apt update -y && sudo apt upgrade -y

# Install Node.js v18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v

# Install MySQL client
sudo apt install mysql-client -y
```

---

## 6️⃣ Test RDS Connection from EC2

```bash
mysql -h your-rds-endpoint.amazonaws.com -u admin -p
```

Inside MySQL shell — create database and table:

```sql
CREATE DATABASE cloudflare_socket_test;
USE cloudflare_socket_test;

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

SHOW TABLES;
EXIT;
```

---

## 7️⃣ Clone Project on EC2

```bash
cd ~
git clone https://github.com/DhruvShah0612/nodejs_project
cd nodejs_project/NodeJS_Socket/backend
ls  # confirm server.js is here
```

---

## 8️⃣ Install Backend Dependencies

```bash
cd ~/nodejs_project/NodeJS_Socket/backend
npm install
```

---

## 9️⃣ Create `.env` File

```bash
nano .env
```

Paste (fill in your actual RDS endpoint and EC2 IP):

```env
DB_HOST=your-rds-endpoint.amazonaws.com
DB_USER=admin
DB_PASSWORD=YourPassword123
DB_NAME=cloudflare_socket_test
PORT=3000
```

Save: `Ctrl+X` → `Y` → `Enter`

---

## 🔟 Update `server.js` — Fix CORS and DB Config

Make sure `server.js` uses `.env` variables and correct CORS origin:

```js
require('dotenv').config();

// DB config — from .env
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// CORS — add your EC2 IP
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://<YOUR-EC2-IP>:3000"],
    methods: ["GET", "POST"]
  }
});
```

Also make sure route order is correct in `server.js`:

```js
// ✅ 1. Static files first
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ✅ 2. API routes
app.get('/api/messages', async (req, res) => { ... });

// ✅ 3. Catch-all LAST
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});
```

---

## 1️⃣1️⃣ Build React Frontend

```bash
cd ~/nodejs_project/NodeJS_Socket/frontend

# Update socket URL in App.jsx to your EC2 IP
nano src/App.jsx
# Change: const socket = io('http://<YOUR-EC2-IP>:3000', { ... });

# Install dependencies
npm install

# Build production dist
npm run build

# Confirm dist folder created
ls dist/
```

---

## 1️⃣2️⃣ Start App with PM2

```bash
cd ~/nodejs_project/NodeJS_Socket/backend

# Start with PM2
pm2 start server.js --name "nodejs-project"

# Save PM2 process list
pm2 save

# Auto-start on system reboot
pm2 startup
# (Copy and run the command PM2 outputs)

# Check status and logs
pm2 status
pm2 logs nodejs-project
```

Expected output:

```
✅ Database connected and table created
✅ Server running on port 3000
Socket.IO server ready, waiting for connections...
```

---

## 1️⃣3️⃣ Open Port 3000 in EC2 Security Group

Go to **AWS Console → EC2 → Security Groups → Edit Inbound Rules → Add Rule:**

| Type | Port | Source |
|---|---|---|
| Custom TCP | 3000 | 0.0.0.0/0 |

---

## 1️⃣4️⃣ Access Your App

Open in browser:

```
# Full app (Frontend + Backend)
http://<EC2-PUBLIC-IP>:3000

# API endpoint
http://<EC2-PUBLIC-IP>:3000/api/messages
```

🎉 **Your Node.js + React + Socket.IO app is now live on EC2 with RDS MySQL!**

---

## ⚡ Useful PM2 Commands

```bash
pm2 status                    # Check running processes
pm2 logs nodejs-project       # View live logs
pm2 restart nodejs-project    # Restart app
pm2 stop nodejs-project       # Stop app
pm2 delete nodejs-project     # Remove from PM2
pm2 delete all                # Remove all processes
```

---

## 🔄 Update / Redeploy After Code Changes

```bash
# Pull latest code
cd ~/nodejs_project
git pull origin main

# Rebuild frontend if changed
cd NodeJS_Socket/frontend
npm run build

# Restart backend
cd ../backend
pm2 restart nodejs-project
pm2 logs nodejs-project
```

---

## 🔐 Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `DB_HOST` | RDS endpoint URL | `nodejs-db.xxxx.rds.amazonaws.com` |
| `DB_USER` | RDS master username | `admin` |
| `DB_PASSWORD` | RDS master password | `YourPassword123` |
| `DB_NAME` | Database name | `cloudflare_socket_test` |
| `PORT` | App port | `3000` |

> ⚠️ **Never push `.env` to GitHub!** Add it to `.gitignore`

---

## 🚨 Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `ETIMEDOUT` | RDS Security Group not open | Add inbound rule: port 3306 from EC2 SG |
| `Unknown database` | DB not created in RDS | Run `CREATE DATABASE` in MySQL shell |
| `ENOENT: no such file or directory dist/` | Frontend not built | Run `npm run build` in frontend folder |
| `Can't add new command when connection is closed` | Single DB connection died | Use `mysql.createPool()` instead of `createConnection()` |
| `Status: Disconnected` in frontend | Wrong EC2 IP or port in App.jsx | Update socket URL to `http://<EC2-IP>:3000` |
| `Script not found` in PM2 | Wrong path to server.js | `cd` to correct folder before `pm2 start` |

---
