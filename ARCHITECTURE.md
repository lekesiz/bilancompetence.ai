# Architecture Overview

This document provides a high-level overview of the Bilan de Compétences AI application architecture.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Application Structure](#application-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Schema](#database-schema)
- [Authentication and Authorization](#authentication-and-authorization)
- [API Design](#api-design)
- [Real-time Communication](#real-time-communication)
- [Third-Party Integrations](#third-party-integrations)
- [Deployment](#deployment)

## Technology Stack

### Backend

- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **Authentication**: Supabase Auth, JWT
- **Real-time**: Socket.IO
- **API Documentation**: Swagger (OpenAPI)
- **Testing**: Jest, Supertest
- **Performance Testing**: Artillery
- **Code Quality**: ESLint, Prettier, Husky

### Frontend

- **Framework**: React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Testing**: Jest, React Testing Library, Playwright

## Application Structure

The project is a monorepo managed with npm workspaces.

```
/
├── apps/
│   ├── backend/
│   └── frontend/
├── packages/
│   ├── ui/
│   └── config/
├── docs/
├── .github/
├── .husky/
└── ...
```

## Backend Architecture

The backend is a layered architecture:

1.  **Routes**: Define API endpoints and handle HTTP requests and responses.
2.  **Middleware**: Handle authentication, authorization, validation, and error handling.
3.  **Services**: Contain business logic and interact with the database.
4.  **Database**: Store application data.

## Frontend Architecture

The frontend is a component-based architecture:

1.  **Components**: Reusable UI elements.
2.  **Pages**: Top-level components that represent a page.
3.  **Services**: Handle API requests and data fetching.
4.  **State**: Manage application state with Redux.

## Database Schema

(To be added)

## Authentication and Authorization

- **Authentication**: Supabase Auth is used for user authentication.
- **Authorization**: JWTs are used to authorize API requests. Middleware is used to protect endpoints and enforce roles.

## API Design

The API is a RESTful API designed with the following principles:

- **Stateless**: Each request is independent and contains all the information needed to process it.
- **Resource-based**: Endpoints are organized around resources (e.g., `/api/users`, `/api/assessments`).
- **JSON**: All data is exchanged in JSON format.
- **Standard HTTP methods**: `GET`, `POST`, `PUT`, `DELETE` are used to perform CRUD operations.

## Real-time Communication

**Socket.IO** is used for real-time communication between the client and server (e.g., chat, notifications).

## Third-Party Integrations

- **Stripe**: For payments.
- **Resend**: For sending emails.
- **France Travail**: For job market data.

## Deployment

The application is deployed on **Vercel**.

- The `main` branch is automatically deployed to production.
- The `develop` branch is automatically deployed to staging.
- Pull requests are automatically deployed to a preview environment.

