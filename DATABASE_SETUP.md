# Instructions for setting up Google Cloud SQL (PostgreSQL)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **SQL** and click **Create Instance**.
3. Choose **PostgreSQL** as the database engine.
4. Fill in the instance ID, default user password, and select a region (preferably close to where your GKE cluster will be).
5. For testing/development, you might want to enable "Public IP" under Connections, but for production, you should use "Private IP" and connect it to the VPC network where your GKE cluster lives.
6. Once the instance is created, create a database (e.g., `davault_db`).
7. Get the connection string. It will look something like this:
   `postgresql://postgres:<YOUR_PASSWORD>@<PUBLIC_IP_OR_PRIVATE_IP>:5432/davault_db`
8. In this project, create a `.env.local` file (or set the environment variable in your deployment platform) and add:
   `DATABASE_URL="postgresql://postgres:<YOUR_PASSWORD>@<IP>:5432/davault_db"`

After setting the `DATABASE_URL` in your environment, run:
`npx prisma db push`
or
`npx prisma migrate dev --name init`
to push the database schema to your new Cloud SQL database!
