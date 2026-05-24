# JIRA Clone

A comprehensive JIRA clone featuring Organizations, Projects, Kanban Boards, and detailed Ticket management. Built with Next.js (Frontend) and Node.js/Express with Prisma (Backend).

## Prerequisites

- **Node.js**: v18 or newer
- **PostgreSQL**: A running PostgreSQL instance (local or hosted like Supabase/Neon)
- **npm** or **yarn**

---

## Setting up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `/backend` directory and add your PostgreSQL connection URL and other required variables:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/jira_clone?schema=public"
   JWT_SECRET="your_jwt_secret_key"
   FRONTEND_URL="http://localhost:3000"
   # Email credentials for OTP/Verification (e.g. Mailtrap)
   SMTP_HOST="sandbox.smtp.mailtrap.io"
   SMTP_PORT=2525
   SMTP_USER="your_smtp_user"
   SMTP_PASS="your_smtp_pass"
   SMTP_FROM="noreply@jiraclone.com"
   ```

4. Set up the Database:
   Generate Prisma client and push the schema to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the Backend server:
   ```bash
   npm run dev
   ```
   The backend API will start on `http://localhost:5000`.

---

## Setting up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the `/frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
   ```

4. Run the Frontend server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

---

## Testing & Review

For a detailed test plan and checklist of features to review, please see [README_TESTING.md](./README_TESTING.md).
