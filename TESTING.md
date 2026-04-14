# Testing DaVault Locally

This guide will walk you through how to download, configure, and run the DaVault application on your local machine for testing and development.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your computer:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Git](https://git-scm.com/)
*   A local PostgreSQL database OR a cloud-hosted database like [Supabase](https://supabase.com/) or [Neon](https://neon.tech/).

## 2. Download the Code

Clone the repository to your local machine:

```bash
git clone https://github.com/n-tS0al-ve/DaVault.git
cd DaVault
```

Install the required dependencies:

```bash
npm install
```

## 3. Local Database Setup (Docker)

The easiest way to set up a local PostgreSQL database for development is using Docker. If you have Docker installed, follow these steps:

1. Open a new terminal window.
2. Run the following command to start a PostgreSQL container:

```bash
docker run --name davault-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

This will create and start a database running in the background. Your connection string for the `.env` file will now be:
`postgresql://postgres:mysecretpassword@localhost:5432/postgres`

*(If you prefer to use a cloud database for development, you can create a free one on [Supabase](https://supabase.com/) or [Neon](https://neon.tech/) and use their provided connection string instead).*

## 4. Environment Configuration

You must set up environment variables for the application to function. 

1. Create a file named `.env` in the root folder of the project.
2. Add the following keys and fill in the values:

```env
# -----------------------------------------------------------------------------
# DATABASE
# -----------------------------------------------------------------------------
# If you used the Docker setup above, use this string:
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"

# -----------------------------------------------------------------------------
# AUTHENTICATION (NextAuth)
# -----------------------------------------------------------------------------
# Generate a secure secret by running `openssl rand -base64 32` in your terminal
NEXTAUTH_SECRET="your_generated_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# -----------------------------------------------------------------------------
# OAUTH PROVIDERS
# -----------------------------------------------------------------------------
# GitHub: Create an OAuth app in GitHub Developer Settings
GITHUB_ID="your_github_oauth_client_id"
GITHUB_SECRET="your_github_oauth_client_secret"

# Google: Create OAuth credentials in Google Cloud Console
GOOGLE_ID="your_google_oauth_client_id"
GOOGLE_SECRET="your_google_oauth_client_secret"

# -----------------------------------------------------------------------------
# STRIPE BILLING
# -----------------------------------------------------------------------------
# Get these from your Stripe Dashboard -> Developers
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### ⚠️ Security Warnings & Best Practices
*   **NEVER commit your `.env` file to GitHub.** The `.gitignore` file is already configured to ignore `.env`, but always double-check.
*   **Never share your `STRIPE_SECRET_KEY` or Database URL.** If these are leaked, malicious users could access your database or make unauthorized charges.
*   **Use Test Keys:** While developing locally, ensure you are using Stripe **Test Mode** API keys (they start with `sk_test_`). Do not use production keys for local development.
*   **Personal Access Tokens:** If you generate GitHub Personal Access Tokens (PATs) to interact with the repository, set expiration dates and delete them immediately if they are accidentally shared.

## 5. Initialize the Database

Once your `.env` file is set up and your PostgreSQL database is running, you need to push the Prisma schema to the database. This will create the necessary tables (Users, Servers, Sessions).

Run the following command:

```bash
npx prisma db push
```

## 6. Start the Application

Start the Next.js development server:

```bash
npm run dev
```

Open your web browser and navigate to: [http://localhost:3000](http://localhost:3000)

## 7. Testing Workflows

Here are a few things you can test once the app is running:

1.  **Authentication:** Click "Sign In" and verify that you can authenticate using your GitHub or Google account.
2.  **Dashboard:** Navigate to the Dashboard. You should see an empty state if you have no servers.
3.  **Create Server:** Click "New Server", fill in a name and Docker image (e.g., `itzg/minecraft-server`), and click save. The server should now appear in your list.
4.  **Stripe Checkout:** Navigate to the Pricing page. If you have configured your Stripe Test Keys and added a real `priceId` to the `src/app/pricing/page.tsx` file, clicking subscribe will redirect you to the Stripe checkout page.

---
*For questions regarding deployment to Google Cloud or Kubernetes, refer to the infrastructure documentation (to be added).*