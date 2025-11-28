# amaris

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, React Router, Hono, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **React Router** - Declarative routing for React
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Hono** - Lightweight, performant server framework
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Google Gemini** - AI-powered image generation via Vercel AI Gateway
- **Vercel AI Gateway** - Request routing, caching, rate limiting, and analytics

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Environment Setup

### 1. Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/amaris
```

3. Apply the schema to your database:
```bash
bun run db:push
```

### 2. Google Gemini API Setup

This project uses Google Gemini for AI-powered image generation.

1. Get your Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add the API key to your `apps/server/.env` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
```

### 3. Other Environment Variables

Add the following to your `apps/server/.env`:

```env
CORS_ORIGIN=http://localhost:5173
POLAR_ACCESS_TOKEN=your_polar_token
POLAR_SUCCESS_URL=http://localhost:5173/success
```

And to your `apps/web/.env`:

```env
VITE_SERVER_URL=http://localhost:3000
```


Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).







## Project Structure

```
amaris/
├── apps/
│   ├── web/         # Frontend application (React + React Router)
│   └── server/      # Backend API (Hono)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:push`: Push schema changes to database
- `bun run db:studio`: Open database studio UI

## AI Image Generation

This project uses **Google Gemini 2.5 Flash Image** for AI-powered image generation, routed through **Vercel AI Gateway** for enhanced performance and observability. The implementation uses the Vercel AI SDK with the following features:

- **AI Gateway Routing**: All requests go through Vercel AI Gateway for caching, rate limiting, and analytics
- **Text-to-Image**: Generate images from text prompts
- **Style Transfer**: Use reference images to guide generation style
- **Multi-modal Output**: Supports both text and image responses
- **Vision Analysis**: Analyze style images using Gemini's vision capabilities
- **Request Observability**: Monitor and track all AI requests through the gateway

### Supported Features

- Aspect ratios: 1:1, 16:9, 9:16, 4:3
- Style-guided generation using reference images
- Automatic image storage via Cloudinary
- Real-time generation tracking

### Model Configuration

The application uses:
- **Image Generation**: `google/gemini-2.5-flash-image-preview`
- **Vision Analysis**: `google/gemini-2.5-flash-preview`

All previous AI models (Fal AI, Prodia, xAI) have been replaced with Google Gemini, routed through Vercel AI Gateway for automatic caching, rate limiting, and analytics—providing a unified, powerful, and production-ready AI experience.
