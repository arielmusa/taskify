# PLAZA - TODO

Plaza Todo is a multi-tenant task management system.
It includes authentication, real time updates with Socket.io and a kanban board per project.

## Requirements

Docker + Docker Compose

(Optional) Node.js 22+ for local development

## Run Locally

Clone the project

```bash
  git clone https://github.com/arielmusa/plaza-todo.git
```

Go to the project directory

```bash
  cd my-project
```

Copy .env files for backend and frontend

```bash
 cp backend/.env.example backend/.env
 cp frontend/.env.example frontend/.env
```

Start the project with Docker

```bash
  docker compose up --build
```

Once the containers are running:

Frontend: http://localhost:5173

Backend: http://localhost:3000

The database is automatically initialized using:
backend/db/init.sql

You can register a new account dictly through the frontend at /register

## Real time updates

Real time events are implemented using Socket.io

- When a user opens a project, the frontend socket joins a room:
  joinProject(projectId) → room: "project_id"

- The backend broadcasts events to that specific room:
  io.to("project_id").emit("taskCreated", task)
  io.to("project_id").emit("taskUpdated", task)
  io.to("project_id").emit("taskDeleted", { id: taskId })

- The frontend listens for these events:
  socket.on("taskCreated", ...)
  socket.on("taskUpdated", ...)
  socket.on("taskDeleted", ...)

## Architecture

Frontend: React (Vite), Bootstrap  
Backend: Node.js, Express, Socket.io  
Database: MySQL  
Auth: JWT  
Environment: Docker & Docker Compose

#### Backend:

- controllers/
  contains the application logic for each domain

- routes/
  Defines all HTTP endpoints. Each route maps incoming API calls to the corresponding controler.

- middleware/

  - auth middleware: JWT verification (protects the routes)
  - tenant middleware: tenant access validation
  - project middleware: project access validation
  - error middleware: centralized error handling
  - socket middleware: attaches the Socke.io instance to requests.

- config/
  contains database configuration

- app.js
  Express app setup

- server.js
  Server entry point. Initializes HTTP server + Socket.io

#### Frontend:

- api/
  containes API modules built on top of a shared Axios instance.

-context/
manages authentication state and handles login/register/logout and session restoration.

- pages/
  The main UI logic is here.

- layouts/
  containes a simple layout that shares the navbar with protected pages.

-routes/
containes PrivateRoute compoent that protects private pages.

---

#### Notes

Statuses are thought to be custom for each project. For this MVP 3 default statuses are created for each project.

When a tenant is created by the user, the user is set as admin of such tenant.

Existing tenants are not publicly visible, and users can only be added manually.
An endpoint is available to add an existing user to a tenant.

Things i'd improve/add:

- add role authorization: tables are there, missing logic and implementation.
- user invitation: inviting user to join tenants
- add unit tests
- UI clarity: break pages into components
- implement swagger UI
- add users routes and controllers.
- handle errors in frontend

## API Reference

#### auth

```http
  POST /api/auth/login
  POST /api/auth/register
  GET /api/auth/profile
```

#### tenants

```http
  GET /api/tenants
  GET /api/tenants/{tenantId}
  POST /api/tenants
  POST /api/tenants/{tenantId}/users
```

#### projects

```http
  GET /api/tenants/{tenantId}/projects
  GET /api/tenants/{tenantId}/projects/{projectId}
  POST /api/tenants/{tenantId}/projects
```

#### tasks

```http
  GET /api/tenants/{tenantId}/projects/{projectId}/tasks
  GET /api/tenants/{tenantId}/projects/{projectId}/tasks/{taskId}
  POST /api/tenants/{tenantId}/projects/{projectId}/tasks
  PUT /api/tenants/{tenantId}/projects/{projectId}/tasks/{taskId}
  DELETE /api/tenants/{tenantId}/projects/{projectId}/tasks/{taskId}
```

#### statuses

```http
  GET /api/tenants/{tenantId}/projects/{projectId}/statuses
  POST /api/tenants/{tenantId}/projects/{projectId}/statuses
```
