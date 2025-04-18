This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Local Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Using Docker

This project includes Docker configuration for both development and production environments.

#### Development Environment

To start the development environment with Docker:

```bash
docker-compose up dev
```

This will:
- Build the development Docker image
- Mount your local codebase inside the container
- Start the Next.js development server with hot-reloading

#### Production Environment

To start the production environment with Docker:

```bash
docker-compose up web
```

This will:
- Build the production Docker image with optimized settings
- Run the Next.js application in production mode
- Be available at http://localhost:3000

#### Building and Running Custom Commands

To build the Docker images:

```bash
docker-compose build
```

To run a one-off command in the development container:

```bash
docker-compose run dev npm install <package-name>
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
