# AI Debate Arena

A simple app to let LLMs debate on any topic and get for and against arguments. The topic could be a decision you want to make, philosophical questions, or literally anything you want to get two sides of the story about.

## How to use

1. Enter a topic you want the models to debate on
2. Choose your models and start
3. For and against models will auto fire off
4. Click continue to start another round

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in the values
3. Run `bun install` to install dependencies
4. Run `bun dev` to start the dev server
5. Go to `http://localhost:5173` and see the live app

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit/introduction)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn Svelte](https://shadcn-svelte.com/) - Svelte port of Shadcn UI
- [Prisma](https://www.prisma.io/) + [Prisma Postgres](https://www.prisma.io/postgres)
- [BetterAuth](https://better-auth.com/)
- [Groq](https://groq.com/) - for super fast inference
- [Tanstack Query](https://tanstack.com/query/latest/docs/svelte/overview)
