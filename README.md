# VENDO Dashboard — Frontend

VENDO Dashboard is the **administration and management frontend** for the VENDO e-commerce platform.

It provides administrators with a centralized dashboard to manage products, categories, brands, users, orders, returns, payments, and other e-commerce operations through a modern and responsive interface.

## 🚀 Features

### 📊 Dashboard

* Overview of store activity
* Total orders
* Revenue statistics
* Average order value
* Order status overview
* Sales and order analytics
* Date range filtering
* Quick access to management sections

### 📦 Product Management

* View products
* Create products
* Edit products
* Delete products
* Manage product status
* Manage product images
* Manage product variants
* Filter and search products

### 🗂️ Category Management

* View categories
* Create categories
* Edit categories
* Delete categories
* Manage category status

### 🏷️ Brand Management

* View brands
* Create brands
* Edit brands
* Delete brands
* Manage brand status

### 👥 User Management

* View registered users
* View user information
* Manage user accounts
* Search and filter users
* Manage account status

### 🛒 Order Management

* View customer orders
* View order details
* Track order status
* Manage order processing
* View payment information
* View customer and shipping information

### 🔄 Return Management

* View return requests
* Review returned items
* Approve or reject return requests
* Inspect returned items
* Process refunds
* Process exchanges
* Track exchange status
* Complete return requests

### 💳 Payment Management

* View payment information
* View payment status
* Review transaction information
* Track refund information

## 🛠️ Technologies

* **React**
* **TypeScript**
* **Vite**
* **React Router**
* **Tailwind CSS**
* **shadcn/ui**
* **Axios**
* **TanStack React Query**
* **TanStack React Table**
* **Sonner**
* **Lucide React**

## 📁 Project Structure

```text
vendo-admin-panel/
├── src/
│   ├── api/
│   │   └── axios.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── users/
│   │   ├── orders/
│   │   └── returns/
│   │
│   ├── data/
│   │
│   ├── hooks/
│   │
│   ├── layouts/
│   │   └── Dashboard.tsx
│   │
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── users/
│   │   ├── orders/
│   │   └── returns/
│   │
│   ├── types/
│   │
│   ├── lib/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── .env
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## ⚙️ Getting Started

### Requirements

Make sure you have installed:

* Node.js
* npm

You can check your versions with:

```bash
node -v
npm -v
```

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

### 2. Navigate to the project

```bash
cd vendo-dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000/api
```

Update the API URL according to your VENDO backend configuration.

### 5. Start the development server

```bash
npm run dev
```

The dashboard will be available at:

```text
http://localhost:5173
```

## 🔗 Backend API

The VENDO Dashboard communicates with the VENDO backend through RESTful APIs.

### Backend

* **Framework:** Laravel
* **Language:** PHP
* **Database:** PostgreSQL
* **API:** RESTful API
* **ORM:** Eloquent

Example:

```env
VITE_API_URL=http://localhost:8000/api
```

Make sure the backend API is running before starting the dashboard.

## 🧭 Dashboard Navigation

The dashboard provides administrators with access to:

```text
VENDO Dashboard
│
├── Dashboard
│
├── Products
│   ├── Product List
│   ├── Add Product
│   └── Edit Product
│
├── Categories
│
├── Brands
│
├── Users
│
├── Orders
│
├── Returns
│   ├── Return Requests
│   ├── Refunds
│   └── Exchanges
│
└── Payments
```

## 🔄 Return, Refund & Exchange Flow

The dashboard supports managing customer return requests.

```text
Customer
   │
   ▼
Return Request
   │
   ▼
Admin Review
   │
   ├── Reject
   │
   └── Approve
          │
          ▼
       Inspection
          │
          ├── Refund
          │
          └── Exchange
                 │
                 ▼
              Processing
                 │
                 ▼
              Completed
```

A return request can contain multiple items, and each item can have its own return type such as **refund** or **exchange**.

## 📅 Dashboard Analytics

Administrators can filter dashboard statistics using a date range.

Example metrics include:

* Total orders
* Active orders
* Total revenue
* Average order value
* Sales performance
* Order status statistics

Date filtering supports selecting a custom date range before applying the filter.

## 📊 Data Tables

The dashboard uses interactive data tables for management screens.

Common table functionality includes:

* Pagination
* Sorting
* Searching
* Filtering
* Status filtering
* Row actions
* Edit actions
* Delete actions
* Responsive layouts

## 🎨 UI & Design

The dashboard uses:

* Tailwind CSS
* shadcn/ui
* Lucide icons
* Responsive layouts
* Reusable components
* Modal dialogs
* Confirmation dialogs
* Toast notifications

The goal is to provide a clean and consistent administration experience.

## 📜 Available Scripts

### Development

```bash
npm run dev
```

Starts the Vite development server.

### Build

```bash
npm run build
```

Creates an optimized production build.

### Preview

```bash
npm run preview
```

Previews the production build locally.

### Lint

```bash
npm run lint
```

Checks the project for code-quality and ESLint issues.

## 🔐 Authentication & Authorization

The dashboard is intended for authorized VENDO administrators.

Protected functionality includes management of:

* Products
* Categories
* Brands
* Users
* Orders
* Returns
* Refunds
* Exchanges
* Payments
* Dashboard analytics

Authorization is handled through the VENDO backend API.

## 🌐 Deployment

Build the application for production:

```bash
npm run build
```

The generated production files can then be deployed to a static hosting platform or served through a web server.

Before deployment, configure:

```env
VITE_API_URL=<production-api-url>
```

## 🔗 Related Projects

### VENDO Customer Frontend

Customer-facing e-commerce application for browsing products, shopping cart, checkout, orders, and account management.

### VENDO Backend

Laravel REST API responsible for authentication, products, orders, payments, returns, refunds, exchanges, and database operations.

## 👨‍💻 Developer

**Nheung Phearakyuth**

Full Stack Developer

### VENDO Technology Stack

| Application       | Technology                 |
| ----------------- | -------------------------- |
| Customer Frontend | Next.js, React, TypeScript |
| Admin Dashboard   | React, TypeScript, Vite    |
| Backend           | Laravel, PHP               |
| Database          | PostgreSQL                 |
| API               | RESTful API                |
| UI                | Tailwind CSS, shadcn/ui    |

## 📌 Project Status

VENDO Dashboard is actively developed as part of the VENDO e-commerce platform.

---

⭐ **VENDO — E-Commerce Management Dashboard**
