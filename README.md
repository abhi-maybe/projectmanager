# Project Manager (Next.js Local-First Platform)

A high-performance, full-stack, open-source project management platform (similar to Jira or Asana) designed with a clean, feature-driven architecture. 

It is built on Next.js 14/15, Tailwind CSS, Shadcn/Radix UI, a type-safe Hono RPC API, and a custom **local-first** storage engine that fallbacks seamlessly to **Vercel KV / Upstash** in serverless environments.

---

## ✨ Primary Features

*   💼 **Isolated Workspaces**: Siloed collaborative workspaces equipped with cascade-deletion mechanics (deleting a workspace automatically purges member registries, project lists, and task records).
*   📊 **Telemetry & Analytics**: Month-over-Month (MoM) telemetry engines calculating progress velocity metrics for total tasks, assigned deadlines, incomplete targets, and overdue schedules.
*   📋 **Multi-View Task switchers**:
    *   **Table View**: Integrates `@tanstack/react-table` for multi-column sort parameters, data search filters, and page indexers.
    *   **Kanban Board**: Powered by `@hello-pangea/dnd` supporting fluid drag-and-drop column reordering with optimistic UI updates.
    *   **Calendar View**: Seamless month-to-month deadline scheduling layout using `react-big-calendar`.
*   🛡️ **Member Registries & Permissions**: Dynamic list interfaces guarding member allocations, role elevations (downgrading/upgrading between `ADMIN` and `MEMBER`), and workspace exit flows.
*   ⚙️ **Client-Safe Bundling & Type Safety**: Full end-to-end type validations across Hono routers, and strict client/server bundle isolation to prevent Next.js build-time compiler exceptions.

---

## 🛠️ Technological Architecture & The local-first Pivot

To enable frictionless local development and zero-cost cloud hosting, the platform operates on a completely decoupled **local-first** and **serverless-compatible** database layout:

```
                  ┌─────────────────────────────────────┐
                  │          Next.js App Router         │
                  └──────────────────┬──────────────────┘
                                     │ (API Calls)
                  ┌──────────────────▼──────────────────┐
                  │           Hono RPC Server           │
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────▼──────────────────┐
                  │    Mock Appwrite Compatibility SDK  │
                  └──────────┬───────────────────┬──────┘
                             │                   │
         (No KV Variables)   │                   │  (KV variables present)
                             ▼                   ▼
                  ┌──────────────────┐   ┌──────────────────┐
                  │  local-db.json   │   │  Vercel KV Cloud │
                  │     on Disk      │   │  (Upstash Redis) │
                  └──────────────────┘   └──────────────────┘
```

1.  **Embedded JSON Document Store (`local-db.json`)**:
    Locally, the application saves all collaborative documents inside a local JSON flat-file. No external database servers, docker setups, or API keys are required to build and test.
2.  **Database-Driven File Storage (Base64)**:
    Images (workspaces and project banner uploads) are encoded into Base64 strings and stored directly within the database under a `files` collection. This completely bypasses Vercel's read-only serverless filesystem constraints, meaning you do not need AWS S3, Cloudinary, or Appwrite Storage buckets!
3.  **Serverless Cloud Database Fallback**:
    When deployed in a serverless environment (such as Vercel), the app automatically detects Vercel KV / Upstash Redis variables (`KV_REST_API_URL` and `KV_REST_API_TOKEN`) and routes all transactional queries dynamically to the cloud KV database over a zero-dependency, low-latency REST API client.

---

## 🚀 Local Quickstart Guide

1.  **Clone the Repository & Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Launch Next.js Dev Server**:
    ```bash
    npm run dev
    ```
3.  **Access the Dashboard**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.
4.  **Log In Immediately**:
    The database comes pre-configured with a private developer demo account so you don't even need to register:
    *   **Email**: `demo@local.first`
    *   **Password**: `password`

*(Note: You can also register brand new local accounts, and your local data will stay completely private inside `/local-db.json` which is ignored in Git).*

---

## ☁️ Deploying to Vercel

The project is 100% configured for one-click Vercel serverless deployment:

1.  **Push the repository** to GitHub/GitLab.
2.  **Import the project** in Vercel.
3.  **Bind a Vercel KV Database**:
    *   Navigate to the **Storage** tab inside your Vercel project dashboard.
    *   Click **Connect Database** -> Select **KV** -> Click **Create New**.
    *   Vercel will automatically bind your secret cloud KV credentials as environment variables.
4.  **Rebuild & Done**:
    Redeploy your project. The application will detect the cloud KV credentials, construct the databases, and scale to the cloud seamlessly!