# DayTracker - Local Setup (Windows)

## Prerequisites

* **Node.js** (version 16 or higher)
* **MySQL** database server
* **Git** (to clone the repository)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd DayTracker
```

### 2. Database Setup

1. Install MySQL on Windows from [mysql.com](https://dev.mysql.com/downloads/installer/).
2. Start the MySQL service (via Windows Services).
3. Open a terminal and log in to MySQL:

   ```bash
   mysql -u root -p
   ```
4. Create the database and run setup:

   ```bash
   cd server
   npm run setup-db
   ```

---

### 3. Backend Setup

```bash
cd server
npm install
npm run build
```

#### Create `.env` in `server/`

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=daystatus

JWT_SECRET=your_jwt_secret_key_here
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

Start backend:

```bash
# Development (with auto-restart)
npm run dev

# Or production
npm start
```
---

### 4. Frontend Setup

```bash
cd client
npm install
```

#### Create `.env` in `client/`

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Start frontend:

```bash
npm run dev
```

---

## Access the Application

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:3001](http://localhost:3001)
