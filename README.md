# TechNova E-Commerce Platform

TechNova is a modern, full-stack e-commerce web application designed for enthusiasts seeking premium electronics, gaming gear, and smart home devices. It features a responsive, dark-mode ready Next.js frontend seamlessly integrated with a high-performance Spring Boot backend powered by MongoDB.

## 🚀 Live Demo
- **Frontend**: [https://ecommerce-frontend-pi-lemon.vercel.app](https://ecommerce-frontend-pi-lemon.vercel.app)
- **Backend API**: [https://products-purchase-1.onrender.com](https://products-purchase-1.onrender.com)

---

## ✨ Key Features

- **Modern UI/UX**: Built with Next.js 16 and Tailwind CSS 4, featuring full system-aware dark mode support and a sleek, animated design.
- **Product Catalog**: Explore curated tech products with detailed product pages and an intuitive Add-to-Cart workflow.
- **Secure Authentication**: Stateless JWT-based authentication system supporting user registration, secure login, and session persistence.
- **Advanced User Profiles**: Dynamic profile management allowing users to update their shipping address and custom tags/interests.
- **Streamlined Checkout Experience**:
  - Auto-fetches and saves user shipping addresses.
  - Interactive **UPI Payment Flow**: Generates dynamic QR codes and validates simulated payment scans instantly.
- **Role-Based Access**: Separation between `USER` and `ADMIN` roles for order management and catalog updates.

---

## 🛠️ Technology Stack

### Frontend (`/ecommerce-frontend`)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **State Management**: React Context API (`AuthContext`, `CartContext`)
- **Deployment**: Vercel

### Backend (`/ecommerce-backend`)
- **Framework**: Java 21 & Spring Boot 3
- **Security**: Spring Security + JSON Web Tokens (JWT)
- **Database**: MongoDB (via Spring Data MongoDB)
- **Architecture**: MVC Pattern (Controllers, Services, Repositories, DTOs)
- **Deployment**: Render

---

## 💻 Running the Project Locally

### Prerequisites
- Node.js (v20+)
- Java JDK 21+
- Maven
- A MongoDB cluster URL

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd ecommerce-backend
   ```
2. Open `src/main/resources/application.yml` and ensure the MongoDB connection string (`spring.data.mongodb.uri`) is configured properly under the `dev` profile.
3. Start the Spring Boot server:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will be running on `http://localhost:8080`.*

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ecommerce-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running on `http://localhost:3000`.*

---

## 📝 API Endpoints Summary

### Authentication
- `POST /api/auth/register`: Create a new account
- `POST /api/auth/login`: Authenticate and receive JWT

### Products
- `GET /api/products`: Fetch all products
- `POST /api/products`: Create a product (Admin only)
- `DELETE /api/products/{id}`: Delete a product (Admin only)

### User Profile
- `GET /api/users/profile`: Fetch current user details
- `PUT /api/users/profile`: Update address and interests

### Orders
- `POST /api/orders`: Place a new order
- `GET /api/orders`: Retrieve user's order history
- `DELETE /api/orders/{id}`: Cancel an order

---

## 🛡️ License & Contact
This project is open-source and intended for educational and portfolio demonstration purposes.

*Created by Aaryaman.*
