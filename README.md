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
- Docker Desktop, or a MongoDB cluster URL

### 1. Start MongoDB

From the repository root, start the local MongoDB service:

```bash
docker compose up -d mongodb
```

### 2. Backend Setup

Port 8080 is already occupied on this machine, so use port 8081 for the local backend. Generate a JWT key in PowerShell and keep it out of source control:

1. Navigate to the backend directory:
   ```bash
   cd ecommerce-backend
   ```
2. Open `src/main/resources/application.yml` and ensure the MongoDB connection string (`spring.data.mongodb.uri`) is configured properly under the `dev` profile.
3. Start the Spring Boot server:
   ```powershell
   $bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$env:SPRING_APPLICATION_JSON = '{"server":{"port":8081}}'
.\mvnw.cmd spring-boot:run
   ```
   *The backend will be running on `http://localhost:8081`.*

### 3. Frontend Setup
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
   NEXT_PUBLIC_API_URL=http://localhost:8081
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
- `POST /api/products`: Create a local marketplace listing
- `DELETE /api/products/{id}`: Delete a product (Admin only)
- `POST /api/admin/catalog/commercetools/products`: Create and publish a commercetools catalog product (Admin only)
- `POST /api/admin/catalog/commercetools/sync`: Import published commercetools catalog products into the storefront cache (Admin only)

### commercetools product catalog

The Admin Dashboard publishes catalog products through the commercetools Product API. The backend keeps the commercetools client secret off the browser, publishes the product there, and stores a small MongoDB projection so the existing storefront can continue reading `GET /api/products`. The generated SKU is returned with the product. Deleting a commercetools-backed product from the admin UI removes it from commercetools first.

Before using the Admin Dashboard's **Publish Product** form:

1. Create a commercetools Project and an API Client with `manage_products:{projectKey}`, `view_products:{projectKey}`, and `view_published_products:{projectKey}` scopes. Keep its client secret private.
2. In Merchant Center, create a simple Product Type with no required variant attributes, then copy its ID.
3. Set the variables shown in `ecommerce-backend/.env.example` in the backend environment. Use the API and auth hostnames for the Project's region. The current storefront displays USD, so leave `COMMERCETOOLS_CURRENCY=USD`.
4. Restart the backend to import published catalog items automatically, or sign in as an Admin and use **Sync commercetools** from `/admin` to refresh them on demand. Sync imports the current published data and hides the original demo seed items after the first commercetools product is imported.

For a local PowerShell session, set the variables before starting the backend, for example:

```powershell
$env:COMMERCETOOLS_PROJECT_KEY = "your-project-key"
$env:COMMERCETOOLS_CLIENT_ID = "your-api-client-id"
$env:COMMERCETOOLS_CLIENT_SECRET = "your-client-secret"
$env:COMMERCETOOLS_API_URL = "https://api.us-central1.gcp.commercetools.com"
$env:COMMERCETOOLS_AUTH_URL = "https://auth.us-central1.gcp.commercetools.com"
$env:COMMERCETOOLS_PRODUCT_TYPE_ID = "your-product-type-id"
```

The storefront's current stock and order flow still use MongoDB. commercetools catalog items without a quantity from its Inventory API are imported as out of stock; inventory updates need a separate integration with commercetools Inventory API and the order lifecycle.

The admin-only API accepts the same fields as the dashboard (image dimensions come from the browser's image load):

```http
POST /api/admin/catalog/commercetools/products
Authorization: Bearer <admin-jwt>
Content-Type: application/json
```

```json
{
  "name": "Studio Wireless Headphones",
  "description": "Over-ear wireless headphones with active noise cancellation.",
  "price": 249.99,
  "imageUrl": "https://cdn.example.com/headphones.jpg",
  "imageWidth": 1200,
  "imageHeight": 1200,
  "stockQuantity": 15
}
```

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
