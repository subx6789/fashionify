# Fashionify 🛍️

Fashionify is a modern, full-stack e-commerce application featuring a bold Neubrutalism user interface and a robust Spring Boot backend. 

## 🚀 Features

- **Public Shop Browsing:** Guests can effortlessly browse products, search, and filter by categories and brands.
- **Secure Authentication:** JWT-based authentication system with separate flows for customers and administrators.
- **Shopping Cart & Checkout:** Seamless cart management and a secure checkout flow (integrated with Razorpay).
- **Personalized Wishlist:** Save and manage favorite items to revisit later.
- **Real-World Product Management:** Products now support size variants (e.g., S, M, L or UK sizes) with individual stock limits, mimicking real e-commerce systems.
- **Modern Search UI:** A modernized, vertical-style search bar with built-in throttling/debouncing for an ultra-smooth experience.
- **Admin Dashboard:** A dedicated portal for administrators to manage products, sizes, stocks, view orders, and upload images seamlessly.
- **Neubrutalism UI:** A gorgeous, bold, and dynamic interface built with TailwindCSS, featuring distinct hard shadows, acid colors, and micro-interactions.
- **Cloudinary Integration:** Efficient product image hosting and delivery via Cloudinary.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React + Vite
- **Styling:** TailwindCSS + Shadcn UI (Neubrutalism Theme)
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM

### Backend
- **Framework:** Java 21 + Spring Boot 3.x
- **Database:** MySQL
- **Security:** Spring Security + JWT
- **Cloud Storage:** Cloudinary (for images)
- **Payment Gateway:** Razorpay (Test Mode)

## 🏗️ Project Structure

The project is structured as a monorepo containing two main folders:

- `/frontend` - Contains the React application.
- `/backend` - Contains the Spring Boot application.

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- Java 21
- Maven
- MySQL Server

### 1. Database Setup
You can either install MySQL locally or run it instantly via Docker.

**Option A: Using Docker (Recommended)**
If you have Docker Desktop installed, simply start the database container:
```bash
cd backend
docker-compose up -d mysql
```

**Option B: Manual MySQL Installation**
Create a MySQL database named `fashionify` in your local MySQL server:
```sql
CREATE DATABASE fashionify;
```

### 2. Backend Setup
Open a terminal window and navigate to the backend directory:
```bash
cd backend
```
Create a `.env` file in the `backend` directory and add the following required variables (you can use `.env.example` as a template):

```env
# Database Credentials
DATABASE_URL=jdbc:mysql://your_host:your_port/defaultdb?sslMode=REQUIRED&sessionVariables=sql_require_primary_key=0
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password

# JWT Authentication
JWT_SECRET=your_random_secret_string_minimum_256_bits_length
JWT_EXPIRATION_MS=86400000

# Admin Credentials
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=Admin.123

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Config (Use Test Mode Keys)
RAZORPAY_KEY_ID=rzp_test_yourkeyid
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the Spring Boot server using the bundled Maven Wrapper (no global Maven installation required):
```bash
# On Mac/Linux:
./mvnw spring-boot:run

# On Windows:
.\mvnw.cmd spring-boot:run
```
*Note: The backend runs on `http://localhost:8080` by default.*

### 3. Frontend Setup
Open a **second, separate terminal window** and navigate to the frontend directory:
```bash
cd frontend
```
Create a `.env` file in the `frontend` directory and define the backend API URL:

```env
VITE_API_URL=http://localhost:8080
```

Install dependencies and start the development server:
```bash
npm install
npm run dev
```
*Note: The frontend runs on `http://localhost:5173` by default. Once both servers are running concurrently, you can interact with the full application!*


## 🔐 Default Admin Credentials
When the backend initializes the database, it automatically creates a default admin account for you:
- **Email:** `admin@gmail.com`
- **Password:** `demo`

## 📄 License
This project is for educational and portfolio purposes.
