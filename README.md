# AI Integrated POS System

![Project Banner](public/banner-placeholder.png)

A modern, full-stack **Point of Sale (POS) System** built for retail businesses. This application combines a fast, intuitive cashier interface with a powerful admin dashboard powered by AI insights.

> **Live Demo**: [Add your demo link here]

## Key Features

### Point of Sale (POS)
- **Fast Checkout Flow**: Optimized minimal-click interface for high-speed transactions.
- **Robust Cart Management**: Easy quantity adjustments, item removal, and real-time tax/discount calculations.
- **Visual Product Grid**: Category-based filtering with stock status indicators (Low Stock, Out of Stock).
- **Toast Notifications**: Interactive feedback for user actions.

### Admin Dashboard
- **Real-time Analytics**: interactive charts for Revenue, Busy Hours, and Top Selling Products.
- **AI-Powered Insights**: Smart widget that analyzes sales trends and suggests inventory actions.
- **Inventory Management**: Track stock levels, update prices, and manage product details.
- **Transaction History**: Complete record of all past orders with detailed breakdown.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: PostgreSQL / SQLite (via Prisma ORM)
- **Authentication**: NextAuth.js
- **Charts**: Recharts

## Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-pos-system.git
   cd smart-pos-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed # Optional: Seed with dummy data
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Future Improvements
- [ ] Stripe Payment Integration
- [ ] Multi-store support
- [ ] Barcode scanner integration
- [ ] Mobile app (React Native)
