Of course. As a senior technical architect, my goal is to distill the technical requirements into a pragmatic blueprint that accelerates development and eliminates unnecessary complexity.

This refined TRD is focused on what the two-person team needs to build the MVP in 8 weeks, prioritizing clarity, speed, and direct alignment with the PRD.

---

# **Technical Requirements Document (TRD) - AI Content SaaS MVP**

## 1. Guiding Principles

*   **Simplicity First:** The architecture must be the simplest possible to meet the MVP requirements. We will avoid premature optimization and complex patterns.
*   **Leverage the Stack:** Fully utilize the features of Next.js, Supabase, and Vercel to minimize boilerplate and infrastructure management.
*   **Developer Velocity:** The structure should enable a single full-stack developer to move quickly without significant context switching.

## 2. Core Technology Stack

| Component           | Technology                | Role & Rationale                                                                        |
| ------------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| **Web Framework**   | Next.js 15 (App Router)   | Handles frontend rendering, server components, and API routes. Ideal for rapid development. |
| **API Layer**       | Hono.js                   | Integrated within Next.js API Routes for fast, lightweight backend logic.                 |
| **Database & Auth** | Supabase (PostgreSQL)     | Provides database, user authentication, and object storage. The integrated solution simplifies the stack. |
| **AI Model**        | OpenAI GPT-4o API         | Core engine for all text generation tasks.                                              |
| **UI Components**   | TailwindCSS + shadcn/ui   | For rapid, consistent, and accessible UI development.                                   |
| **State Management**| @tanstack/react-query     | Manages all server state, caching, and data fetching. Client state will use React hooks (`useState`, `useContext`). |
| **Payments**        | TossPayments SDK          | To be integrated post-beta for the Pro Plan upgrade flow. Not a blocker for MVP launch. |

## 3. System Architecture & Directory Structure

We will adopt a feature-centric, co-located structure. This is lean and scales well for a small team. The overly-nested structure from the initial draft is flattened to improve velocity.

```
/
├── public/                     # Static assets (images, fonts)
├── supabase/migrations/        # Database schema migrations
└── src/
    ├── app/                    # Next.js App Router
    │   ├── (auth)/             # Routes for auth pages (login, signup)
    │   │   └── page.tsx
    │   ├── (main)/             # Main application routes (protected)
    │   │   ├── dashboard/      # Dashboard page
    │   │   └── editor/[id]/    # Article editor page
    │   ├── api/[[...route]]/   # Hono.js entrypoint for all API calls
    │   └── layout.tsx
    ├── components/
    │   └── ui/                 # Auto-generated shadcn/ui components
    ├── features/               # Core application logic modules
    │   ├── article-editor/     # All logic for the editor feature
    │   │   ├── components/     # React components specific to the editor
    │   │   ├── editor-actions.ts # Server Actions for saving, regenerating
    │   │   └── seo-checker.ts  # Client-side SEO scoring logic
    │   ├── dashboard/          # Dashboard feature
    │   └── style-guide/        # Style guide (brand voice) feature
    └── lib/
        ├── supabase/           # Supabase client setup (client & server)
        ├── openai.ts           # OpenAI API client wrapper
        └── utils.ts            # Shared utility functions (e.g., cn)
```

## 4. Data Model (Supabase PostgreSQL Schema)

This schema is the minimum required for the MVP. We will use Supabase's built-in `auth.users` table for user management.

```sql
-- Users are handled by Supabase Auth. We reference them via UUID.

-- Table to store user-defined style guides (brand voice)
CREATE TABLE style_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    guide_name TEXT NOT NULL,
    brand_voice TEXT NOT NULL, -- e.g., "Witty and Casual", "Formal and Authoritative"
    target_audience TEXT NOT NULL, -- e.g., "Beginner developers", "Marketing managers"
    language VARCHAR(2) NOT NULL, -- 'en' or 'ko'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table to store generated articles
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    style_guide_id UUID REFERENCES style_guides(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'completed'
    keyword TEXT NOT NULL,
    title TEXT,
    content_markdown TEXT,
    meta_description TEXT,
    seo_score INT DEFAULT 0,
    time_saved_minutes INT DEFAULT 0, -- Estimated time saved
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE style_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policies to ensure users can only access their own data
CREATE POLICY "user_can_access_own_guides" ON style_guides FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_can_access_own_articles" ON articles FOR ALL USING (auth.uid() = user_id);
```

## 5. Core Logic & API Endpoints

Authentication is managed by Supabase Auth middleware on protected routes. API logic will be centralized through Hono.

**API Endpoint:** `POST /api/articles/generate`

**Request Body:**
```json
{
  "keyword": "How to start a SaaS business",
  "styleGuideId": "uuid-of-the-style-guide"
}
```

**Generation Flow:**

1.  **Client Request:** The user clicks "Generate" in the UI, triggering the API call.
2.  **API Route (Hono):**
    *   Authenticates the user via Supabase session.
    *   Retrieves the specified `style_guide` from the database.
    *   Checks the user's article count against the free tier limit (3 articles).
3.  **Prompt Engineering:**
    *   Constructs a single, comprehensive prompt for GPT-4o. The prompt will request a JSON object containing: `title`, `meta_description`, and `article_body` (as a Markdown string with H2/H3 tags).
    *   The prompt will incorporate the user's keyword and all parameters from their `style_guide` (voice, audience, language).
4.  **OpenAI API Call:**
    *   Calls the GPT-4o API with the engineered prompt. Using streaming is **not** required for the MVP to keep the initial implementation simple. The process should complete within the 5-minute target.
5.  **Database Insert:**
    *   Parses the JSON response from OpenAI.
    *   Creates a new record in the `articles` table with the generated content and `status = 'draft'`.
    *   Calculates an estimated `time_saved_minutes` (e.g., constant value of 120 minutes).
6.  **API Response:** Returns the `id` of the newly created article. The client then redirects to the editor page (`/editor/{id}`).

## 6. Key Implementation Details

*   **Onboarding Wizard:** A simple multi-step client-side component that collects data for the user's first `style_guide` and saves it to the database upon completion.
*   **One-Screen Editor:**
    *   The editor will be a single React component that fetches the article data using `@tanstack/react-query`.
    *   It will use a standard textarea for Markdown editing. No complex rich-text editor is needed for the MVP.
    *   "Regenerate Paragraph" will be a Server Action that takes the paragraph's context and re-runs a targeted, smaller prompt through the OpenAI API, updating the content in-place.
*   **Real-time SEO Check:** A client-side utility function (`/features/article-editor/seo-checker.ts`). It will perform simple, non-blocking checks on the `content_markdown` state for:
    *   Keyword presence in title and H-tags.
    *   Word count.
    *   Meta description length.
*   **Cost Management:**
    *   The generation prompt will explicitly request an article length between 1,500-2,500 words to control token usage.
    *   The backend will enforce a hard limit: free users can only call the `POST /api/articles/generate` endpoint 3 times. This is tracked by counting rows in the `articles` table for the user.