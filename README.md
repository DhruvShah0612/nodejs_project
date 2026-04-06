# 🚀 Full Stack Node.js Socket.IO Deployment on AWS EC2

## 📌 Project Overview

This project demonstrates how to deploy a **full-stack real-time application** using:

* **Frontend**: Vite (React)
* **Backend**: Node.js + Socket.IO
* **Database**: MySQL
* **Web Server**: Nginx
* **Process Manager**: PM2
* **Cloud**: AWS EC2 (Ubuntu)

---

## 🏗️ Architecture

```
User (Browser)
     ↓
Nginx (Port 80)
     ↓
Node.js Backend (Port 3001)
     ↓
MySQL Database (Port 3306)
```

---

## ⚙️ Step 1: Launch EC2 Instance

* OS: Ubuntu 22.04
* Instance: t2.micro

### 🔐 Security Group

| Port | Purpose |
| ---- | ------- |
| 22   | SSH     |
| 80   | HTTP    |
| 443  | HTTPS   |

> ❌ Do NOT expose port 3001 (backend runs internally)

---

## 🔐 Step 2: Connect to EC2

```bash
chmod 400 key.pem
ssh -i key.pem ubuntu@<public-ip>
```

---

## 📥 Step 3: Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Other tools
sudo apt install nginx mysql-server git -y
```

---

## 📦 Step 4: Clone Repository

```bash
git clone https://github.com/DhruvShah0612/nodejs_project.git
cd nodejs_project/NodeJS_Socket
```

---

## 🗄️ Step 5: MySQL Setup

```bash
sudo mysql
```

```sql
CREATE DATABASE cloudflare_socket_test;

CREATE USER 'devuser'@'localhost' IDENTIFIED BY 'StrongPassword123!';

GRANT ALL PRIVILEGES ON cloudflare_socket_test.* TO 'devuser'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

---

## ⚙️ Step 6: Backend Setup

```bash
cd backend
npm install
```

---

## 🔐 Step 7: Environment Variables (.env)

Create `.env` file:

```bash
nano .env
```

```env
PORT=3001

DB_HOST=localhost
DB_USER=devuser
DB_PASSWORD=StrongPassword123!
DB_NAME=cloudflare_socket_test
```

---

## ▶️ Step 8: Run Backend

```bash
node server.js
```

---

## 🔄 Step 9: Run with PM2

```bash
sudo npm install -g pm2

pm2 start server.js --name backend
pm2 save
pm2 startup
```

---

## 🎨 Step 10: Frontend Setup

```bash
cd ../frontend
npm install
npm run build
```

---

## 🌐 Step 11: Deploy Frontend (Nginx)

```bash
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
```

---

## ⚙️ Step 12: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001/socket.io/;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;

        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
    }
}
```

---

## 🔄 Step 13: Restart Services

```bash
sudo nginx -t
sudo systemctl restart nginx

pm2 restart backend
```

---

## 🔗 Step 14: Frontend Socket Configuration

```js
const socket = io("/", {
  transports: ["websocket"]
});
```

---

## 🌍 Step 15: Access Application

```
http://<public-ip>
```

---

## 🔁 Application Flow

```
Browser → Nginx → Node.js → MySQL
              ↕
           Socket.IO
```

---

## 🔐 Best Practices

* Use `.env` for sensitive data
* Avoid using MySQL root user
* Do not expose backend ports
* Use PM2 for process management
* Use Nginx as reverse proxy

---

## 🎯 Features

* Real-time messaging (Socket.IO)
* Messages stored in MySQL
* REST API (`/api/messages`)
* Auto-reconnect support
* Production-ready deployment

---

## 🧪 Troubleshooting

### ❌ Socket disconnected

* Check Nginx config
* Rebuild frontend
* Restart services

### ❌ Database error

* Ensure DB exists
* Check `.env` credentials

### ❌ Frontend not updating

```bash
npm run build
sudo cp -r dist/* /var/www/html/
```

---

<img width="637" height="849" alt="image" src="https://github.com/user-attachments/assets/e40103e9-6b5d-422b-93dc-90a0f982c469" />

<img width="628" height="207" alt="image" src="https://github.com/user-attachments/assets/41d7d9e9-6db0-4189-99e9-272bff8913a3" />

