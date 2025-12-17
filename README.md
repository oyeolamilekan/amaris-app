# Amaris

Amaris is a full-stack SaaS application for AI-powered image generation, built with the **Better-T-Stack**. It features a modern chat-based interface that allows users to generate images using text prompts and style references, leveraging the power of Google's Gemini 2.5 models through the Vercel AI Gateway.

## 🚀 Features

- **AI Image Generation**: Generate high-quality images using `google/gemini-2.5-flash-image-preview`.
- **Style Transfer**: Upload reference images to guide the style of generated outputs.
- **Chat Interface**: Conversational workflow for iterating on prompts and results.
- **Vision Capabilities**: Analyze style images using Gemini's vision capabilities.
- **Credit System**: Built-in credit management for usage limits and monetization.
- **Authentication**: Secure social signin authentication via Better-Auth.
- **Payments**: Subscription and one-time payment support via Polar.sh.
- **Responsive UI**: Modern, dark-mode enabled interface built with React 19, TailwindCSS 4, and shadcn/ui.

## 🛠 Tech Stack

### Core
- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime and package manager.
- **Monorepo**: Turborepo-style workspace structure.

### Frontend (`apps/web`)
- **Framework**: React 19 + React Router 7.
- **Styling**: TailwindCSS 4 + shadcn/ui.
- **State Management**: TanStack Query.
- **Forms**: TanStack Form + Zod.

### Backend (`apps/server`)
- **Server**: [Hono](https://hono.dev) - Ultrafast web framework.
- **AI**: Vercel AI SDK + Google Gemini.
- **Storage**: Cloudinary (Image storage).

### Data & Auth (`packages/db`, `packages/auth`)
- **Database**: PostgreSQL.
- **ORM**: Drizzle ORM.
- **Auth**: Better-Auth.

## 🏗 Architecture

The project is structured as a monorepo:

```
amaris/
├── apps/
│   ├── web/                    # React frontend application
│   │   ├── src/routes/         # File-based routing
│   │   └── src/components/     # UI components
│   │
│   └── server/                 # Hono backend API
│       ├── src/routes/         # API endpoints
│       ├── src/services/       # Business logic (AI, Credits, Chat)
│       └── src/constants.ts    # Shared types and constants
│
├── packages/
│   ├── auth/                   # Shared authentication configuration
│   ├── db/                     # Database schema and Drizzle config
│   └── config/                 # Shared TypeScript configuration
```

## 🤖 AI Implementation

Amaris uses a sophisticated AI pipeline:

1.  **Gateway**: All AI requests are routed through **Vercel AI Gateway** for caching, rate limiting, and observability.
2.  **Models**:
    *   **Generation**: `google/gemini-2.5-flash-image-preview` for creating images.
    *   **Vision/Text**: `google/gemini-2.5-flash-preview` for analyzing style references and processing prompts.
3.  **Workflow**:
    *   User uploads a style reference (optional).
    *   User enters a text prompt in the chat.
    *   The backend processes the request, deducting credits.
    *   Gemini generates the image based on the prompt and style reference.
    *   Result is stored and displayed in the chat stream.

## 🏁 Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed.
- PostgreSQL database.
- Google AI Studio API Key.
- Cloudinary Account.
- Polar.sh Account (optional for payments).

### Installation

1.  **Install dependencies**:
    ```bash
    bun install
    ```

2.  **Environment Setup**:

    Create `apps/server/.env`:
    ```env
    # Database
    DATABASE_URL=postgresql://user:password@localhost:5432/amaris

    # AI
    GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

    # Security
    CORS_ORIGIN=http://localhost:5173

    # Payments (Polar.sh)
    POLAR_ACCESS_TOKEN=your_polar_token
    POLAR_SUCCESS_URL=http://localhost:5173/success

    # Storage (Cloudinary)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

    Create `apps/web/.env`:
    ```env
    VITE_SERVER_URL=http://localhost:3000
    ```

3.  **Database Setup**:
    Push the schema to your database:
    ```bash
    bun run db:push
    ```

4.  **Run Development Server**:
    Start both frontend and backend:
    ```bash
    bun run dev
    ```

    - Frontend: [http://localhost:5173](http://localhost:5173)
    - Backend: [http://localhost:3000](http://localhost:3000)

## 💾 Database Schema

Key tables in the application:

- **User & Auth**: `user`, `session`, `account` (Managed by Better-Auth).
- **Generations**:
    - `chat`: Stores conversation threads.
    - `chat_message`: Stores individual messages and image references.
    - `generation`: Tracks generation requests, status, and metadata.
    - `style_reference`: Stores user-uploaded style reference images.
- **Economy**:
    - `user_credits`: Tracks user credit balances.
    - `credit_package`: Defines purchasable credit bundles.

## 📜 Scripts

- `bun run dev`: Start all apps in dev mode.
- `bun run build`: Build all apps for production.
- `bun run db:push`: Push schema changes to DB.
- `bun run db:studio`: Open Drizzle Studio to view data.
- `bun run check-types`: Run TypeScript validation.

## 📄 License

This project is licensed under the MIT License.
