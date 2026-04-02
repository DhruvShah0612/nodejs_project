# Socket.IO Test Project

A minimal Socket.IO project with Node.js backend, React frontend, and MySQL database.

## Setup Instructions

### 1. Database Setup
```bash
mysql -u root -p123 < setup-db.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Server will run on http://localhost:3001

### 3. Frontend Setup
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:5173

## Testing Socket Connection

1. Open multiple browser tabs to http://localhost:5173
2. Type messages in any tab
3. Messages should appear in real-time across all tabs
4. Check MySQL database for stored messages

## EC2 Deployment Notes

- Update frontend socket connection URL to your EC2 public IP
- Ensure ports 3001 and 5173 are open in security groups
- Install Node.js and MySQL on EC2 instance