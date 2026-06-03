
<div align="center">

# 🧠⚛️ NeuroSpace Admin

### Modern Administration Dashboard for the NeuroSpace Platform

**NeuroSpace Admin** is a secure and modern administration dashboard designed to manage, monitor and analyze the activity of the NeuroSpace platform.

It provides administrators with a centralized interface to supervise users, training jobs, analytics, platform insights, settings and user management operations.

<br/>

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-TypeScript-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Admin Dashboard](https://img.shields.io/badge/Admin-Dashboard-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-CDDL%201.0-orange?style=for-the-badge)

</div>

---

## 📌 Overview

**NeuroSpace Admin** is the administration interface of the NeuroSpace ecosystem.

While the main NeuroSpace platform allows users to upload numerical datasets and compare classical machine learning models with quantum machine learning models, **NeuroSpace Admin** is dedicated to platform supervision and management.

The dashboard gives administrators access to key information about users, platform activity, training operations, analytics, subscriptions, and system insights through a clean, modern and responsive interface.

---

## 🎯 Main Objective

The main objective of **NeuroSpace Admin** is to provide a secure and centralized control panel for managing the NeuroSpace platform.

It allows administrators to answer questions such as:

- How many users are registered?
- What is the current platform activity?
- Which training jobs were recently launched?
- What plans or subscriptions are used by users?
- What are the revenue trends?
- Which users need to be managed?
- What insights can be extracted from platform usage?

---

## ✨ Key Features

NeuroSpace Admin includes several administration features:

- Secure admin login
- Protected dashboard access
- Global platform metrics
- User management
- User details page
- Training activity tracking
- Recent trainings feed
- Revenue analytics
- Plan distribution visualization
- Platform insights pages
- Settings page
- Admin-only delete user API route
- Reusable UI components
- Modern sidebar layout
- Loading skeletons and status badges
- Supabase integration
- RLS policies and database security

---

## 🖥️ Admin Interface Sections

### 1. Authentication

The admin dashboard includes a dedicated login screen located in:

```txt
src/app/login-screen
````

This section contains:

* `LoginBrand.tsx`
* `LoginForm.tsx`

It provides a clean authentication interface for administrators.

---

### 2. Dashboard

The main dashboard is located in:

```txt
src/app/dashboard
```

It contains a modern admin overview with statistics, charts and recent activity.

Main dashboard components include:

* `DashboardContent.tsx`
* `MetricsBentoGrid.tsx`
* `PlanDistributionChart.tsx`
* `RecentTrainingsFeed.tsx`
* `RevenueChart.tsx`
* `TrainingsAreaChart.tsx`

This page allows administrators to quickly understand the state of the platform.

---

### 3. Analytics

The analytics page is located in:

```txt
src/app/analytics
```

It is designed to display platform analytics, usage statistics and performance indicators.

This section helps administrators understand user behavior and platform evolution.

---

### 4. Insights

The insights page is located in:

```txt
src/app/insights
```

It provides deeper analysis of the platform activity and can be used to display useful indicators about training jobs, users, datasets or subscriptions.

---

### 5. User Management

The user management module is located in:

```txt
src/app/user-management
```

It includes:

* A global user management page
* A user details page
* A reusable user management component

Main files:

```txt
src/app/user-management/page.tsx
src/app/user-management/components/UserManagementContent.tsx
src/app/user-management/[id]/page.tsx
```

This section allows administrators to view and manage users registered on the platform.

---

### 6. Settings

The settings page is located in:

```txt
src/app/settings
```

It is used to manage platform configuration, admin preferences or future system options.

---

### 7. Admin API Routes

The project includes a protected admin API route:

```txt
src/app/api/admin/delete-user/route.ts
```

This route is designed to allow administrators to delete users securely.

Since this operation is sensitive, it must be protected and must use server-side environment variables only.

---

## 🧱 Project Architecture

The project follows a clean and modular architecture.

```txt
NeuroSpace Admin
│
├── public
│   ├── favicon.ico
│   └── assets/images
│       ├── app_logo.png
│       └── no_image.png
│
├── src
│   ├── app
│   │   ├── analytics
│   │   ├── api/admin/delete-user
│   │   ├── dashboard
│   │   ├── insights
│   │   ├── login-screen
│   │   ├── settings
│   │   └── user-management
│   │
│   ├── components
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── ui
│   │       ├── AppIcon.tsx
│   │       ├── AppImage.tsx
│   │       ├── AppLogo.tsx
│   │       ├── ConfirmModal.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       └── StatusBadge.tsx
│   │
│   ├── contexts
│   │   └── AuthContext.tsx
│   │
│   ├── lib
│   │   ├── auth.ts
│   │   ├── data.ts
│   │   ├── supabase.ts
│   │   ├── types.ts
│   │   ├── mappers
│   │   ├── supabase
│   │   └── utils
│   │
│   └── styles
│       ├── index.css
│       └── tailwind.css
│
└── supabase
    └── migrations
        └── admin_rls_policies.sql
```

---

## 🎨 Modern UI Design

NeuroSpace Admin is designed with a modern dashboard style.

The interface includes:

* Clean sidebar navigation
* Dark and futuristic visual identity
* Reusable UI components
* Bento-style metrics grid
* Interactive charts
* Status badges
* Loading skeletons
* Confirmation modals
* Responsive layout
* Professional admin experience

The design is inspired by modern SaaS dashboards and is adapted to the scientific and technological identity of NeuroSpace.

---

## 📊 Dashboard Components

### Metrics Bento Grid

The `MetricsBentoGrid` component displays key platform indicators in a modern bento-style layout.

It may include:

* Total users
* Active users
* Total trainings
* Completed trainings
* Failed trainings
* Revenue indicators

---

### Revenue Chart

The `RevenueChart` component is used to visualize financial or subscription-related activity.

It helps administrators monitor platform growth and revenue evolution.

---

### Trainings Area Chart

The `TrainingsAreaChart` component displays training activity over time.

It can be used to track the number of experiments launched on the platform.

---

### Plan Distribution Chart

The `PlanDistributionChart` component shows how users are distributed across different plans or subscription types.

---

### Recent Trainings Feed

The `RecentTrainingsFeed` component displays recent training jobs and platform activity.

It gives administrators a quick overview of the latest actions performed by users.

---

## 🔐 Security

Security is a key part of NeuroSpace Admin.

The platform includes:

* Admin authentication
* Protected routes
* Supabase Auth integration
* Role-based access control
* Admin-specific API routes
* Row Level Security policies
* Secure server-side operations

Sensitive variables such as the Supabase service role key must never be exposed in frontend components.

They must only be used in server-side API routes.

---

## 🗄️ Supabase Integration

NeuroSpace Admin uses Supabase for:

* Authentication
* Database management
* User data
* Role management
* Platform data
* Storage access
* Security policies

The project includes a Supabase migration file:

```txt
supabase/migrations/20260420182225_admin_rls_policies.sql
```

This migration is used to define admin-related Row Level Security policies.

---

## 🛠️ Technologies Used

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### UI and Design

* Modern dashboard layout
* Responsive components
* Custom reusable UI components
* Charts and analytics components

### Backend / API

* Next.js API Routes
* Admin delete-user API
* Server-side Supabase operations

### Database and Authentication

* Supabase
* PostgreSQL
* Supabase Auth
* Row Level Security policies

### Deployment and Tools

* GitHub
* Vercel
* Supabase
* Environment variables

---

## 🔁 Admin Workflow

The general workflow of NeuroSpace Admin is:

1. Administrator opens the admin dashboard.
2. Administrator logs in through the login screen.
3. The system verifies the admin role.
4. The dashboard loads global metrics and charts.
5. Administrator can monitor users, trainings, analytics and insights.
6. Administrator can access user management.
7. Sensitive actions, such as user deletion, are handled through secure API routes.
8. The dashboard helps supervise and maintain the NeuroSpace platform.

---

## 🔐 Environment Variables

Create a `.env.local` file and add the required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Important:

```txt
SUPABASE_SERVICE_ROLE_KEY must never be exposed with NEXT_PUBLIC_.
It must only be used on the server side.
```

---

## ⚙️ Installation

### Prerequisites

Before running the project locally, make sure you have:

* Node.js installed
* Git installed
* A Supabase project
* Required environment variables

---

### Local Installation

```bash
git clone https://github.com/mnskaho/NeuroSpace-Admin.git
cd NeuroSpace-Admin
npm install
npm run dev
```

The application usually runs on:

```bash
http://localhost:3001
```

</div>
```
