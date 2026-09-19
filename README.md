# VENDO Dashboard — Frontend

VENDO Dashboard is the **administration and management frontend** for the VENDO e-commerce platform.

It is built with **Next.js, React, and TypeScript** and provides administrators with a centralized interface for managing products, categories, brands, users, orders, returns, refunds, exchanges, payments, and store analytics.

## 🚀 Features

### 📊 Dashboard

* Store overview
* Total orders
* Active orders
* Total revenue
* Average order value
* Order status statistics
* Sales analytics
* Custom date range filtering

### 📦 Product Management

* View products
* Create products
* Edit products
* Delete products
* Product search and filtering
* Product status management
* Product image management
* Product variant management

### 🗂️ Category Management

* View categories
* Create categories
* Edit categories
* Delete categories
* Category status management

### 🏷️ Brand Management

* View brands
* Create brands
* Edit brands
* Delete brands
* Brand status management

### 👥 User Management

* View users
* Search users
* Filter users
* View user information
* Manage user accounts

### 🛒 Order Management

* View customer orders
* View order details
* Manage order status
* View customer information
* View shipping information
* View payment information

### 🔄 Return Management

* View return requests
* Review returned items
* Approve or reject returns
* Inspect returned products
* Process refunds
* Process exchanges
* Track exchange status
* Complete return requests

### 💳 Payment Management

* View payment information
* View payment status
* View transaction information
* Manage refund information

## 🛠️ Technologies

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **shadcn/ui**
* **Axios**
* **TanStack React Query**
* **TanStack React Table**
* **Sonner**
* **Lucide React**
* **Next.js App Router**

## 📁 Project Structure

```text
vendo-dashboard/
├── app/
│   ├── dashboard/
│   ├── products/
│   ├── categories/
│   ├── brands/
│   ├── users/
│   ├── orders/
│   ├── returns/
│   └── ...
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── products/
│   ├── categories/
│   ├── brands/
│   ├── users/
│   ├── orders/
│   └── returns/
│
├── hooks/
│
├── lib/
│   ├── api/
│   └── utils/
│
├── types/
│
├── public/
│
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Getting Started

### Requirements

Make sure you have installed:

* Node.js
* npm

Check your installed versions:

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

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Update the API URL according to your VENDO backend configuration.

### 5. Start the development server

```bash
npm run dev
```

Open the dashboard:

```text
http://localhost:3000
```

## 🔗 Backend API

The VENDO Dashboard communicates with the VENDO backend through RESTful APIs.

### Backend Stack

* **Framework:** Laravel
* **Language:** PHP
* **Database:** PostgreSQL
* **API:** RESTful API
* **ORM:** Eloquent

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Make sure the Laravel backend is running before using API-dependent features.

## 🧭 Dashboard Modules

```text
VENDO Dashboard
│
├── Dashboard
│   ├── Analytics
│   ├── Revenue
│   ├── Orders
│   └── Average Order Value
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

## 🔄 Return, Refund & Exchange

VENDO supports a complete return management workflow.

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

A single return request can contain **multiple return items**, and each item can have its own return type:

```text
Return Request
├── Item 1 → Refund
├── Item 2 → Exchange
└── Item 3 → Refund
```

## 📅 Dashboard Analytics

Administrators can select a custom date range to analyze store performance.

Available metrics can include:

* Total orders
* Active orders
* Total revenue
* Average order value
* Order status
* Sales performance

The selected date range is applied to the dashboard statistics.

## 📊 Data Tables

Management pages use interactive data tables with features such as:

* Search
* Filtering
* Sorting
* Pagination
* Status filters
* Row actions
* Edit actions
* Delete actions

## 🎨 UI & Design

The dashboard is built with a modern and responsive interface using:

* **Tailwind CSS**
* **shadcn/ui**
* **Lucide React**
* Reusable components
* Responsive layouts
* Modal dialogs
* Confirmation dialogs
* Toast notifications

## 🔐 Authentication & Authorization

The dashboard is designed for authorized VENDO administrators.

Protected management areas include:

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

Authentication and authorization are handled through the VENDO backend API.

## 📜 Available Scripts

### Development

```bash
npm run dev
```

Starts the Next.js development server.

### Build

```bash
npm run build
```

Creates an optimized production build.

### Production

```bash
npm run start
```

Starts the production Next.js server.

### Lint

```bash
npm run lint
```

Runs ESLint to check the project.

## 🌐 Deployment

Create a production build:

```bash
npm run build
```

Then start the production server:

```bash
npm run start
```

Configure the production API URL in your environment variables:

```env
NEXT_PUBLIC_API_URL=<production-api-url>
```

The dashboard can be deployed to platforms that support Next.js, including [Vercel](https://vercel.com?utm_source=chatgpt.com).

## 🔗 VENDO Project

VENDO is an e-commerce platform consisting of multiple applications.

| Application       | Technology                 |
| ----------------- | -------------------------- |
| Customer Frontend | Next.js, React, TypeScript |
| Admin Dashboard   | Next.js, React, TypeScript |
| Backend API       | Laravel, PHP               |
| Database          | PostgreSQL                 |
| API Architecture  | RESTful API                |
| UI                | Tailwind CSS, shadcn/ui    |

## 👨‍💻 Developer

**Nheung Phearakyuth**

Full Stack Developer

---

⭐ **VENDO — E-Commerce Management Dashboard**
