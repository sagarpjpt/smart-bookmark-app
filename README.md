# Smart Bookmark Manager

A full-stack bookmark management application built with Next.js 14, Supabase, and Tailwind CSS. Features Google OAuth authentication, real-time updates, and a clean user interface.

## Features

- Google OAuth authentication (no email/password required)
- Create, read, update, delete bookmarks
- Real-time synchronization across multiple tabs
- Search functionality
- Pagination support
- Private bookmarks per user
- Responsive design

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## Project Structure

```
smart-bookmark-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── bookmarks/          # API routes for bookmark operations
│   │   │       ├── route.ts        # GET (list) and POST (create)
│   │   │       └── [id]/
│   │   │           └── route.ts    # DELETE and PATCH (update)
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts        # OAuth callback handler
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page with auth check
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── LoginButton.tsx         # Google OAuth login component
│   │   └── BookmarkList.tsx        # Main bookmark manager UI
│   ├── lib/
│   │   ├── supabase-browser.ts     # Supabase client for browser
│   │   ├── supabase-server.ts      # Supabase client for server
│   │   └── bookmark-service.ts     # Business logic layer
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── database-schema.sql             # Database schema and policies
└── package.json
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-bookmark-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to the SQL Editor in your Supabase dashboard
4. Copy and paste the contents of `database-schema.sql`
5. Run the SQL to create the bookmarks table and policies

### 4. Configure Google OAuth

1. In Supabase Dashboard, go to Authentication → Providers
2. Enable Google provider
3. Go to [Google Cloud Console](https://console.cloud.google.com)
4. Create a new project or select existing one
5. Go to APIs & Services → Credentials
6. Create OAuth 2.0 Client ID
7. Add authorized redirect URIs:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
8. Copy Client ID and Client Secret to Supabase Google provider settings
9. Save the configuration

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in Supabase Dashboard → Project Settings → API

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

**Important**: After deploying to Vercel, add your Vercel URL to Google OAuth authorized redirect URIs:
- `https://your-app.vercel.app/auth/callback`

## Problems Encountered and Solutions

### Problem 1: Supabase Client Configuration

**Issue**: Initial confusion about when to use server vs. browser Supabase clients.

**Solution**: Created separate client files:
- `supabase-browser.ts` for client components (uses `createClientComponentClient`)
- `supabase-server.ts` for server components and API routes (uses `createServerComponentClient`)

This separation ensures proper session management and prevents hydration errors.

### Problem 2: Google OAuth Redirect Loop

**Issue**: After Google authentication, users would get stuck in a redirect loop or see "Invalid redirect URL" error.

**Solution**: 
1. Created dedicated `/auth/callback` route to handle OAuth code exchange
2. Configured proper redirect URL in Google Cloud Console
3. Added the callback URL to Supabase Google provider settings
4. The callback route exchanges the code for a session and redirects to home

### Problem 3: Real-time Updates Not Working Across Tabs

**Issue**: When adding a bookmark in one tab, it wouldn't appear in another tab without manual refresh.

**Solution**: Implemented Supabase Realtime subscriptions in `BookmarkList.tsx`:
- Subscribe to `postgres_changes` events on the bookmarks table
- Listen for INSERT, UPDATE, and DELETE events
- Automatically refetch bookmarks when changes are detected
- Clean up subscription on component unmount

### Problem 4: Row Level Security Blocking Queries

**Issue**: After enabling RLS, users couldn't see any bookmarks even though they were authenticated.

**Solution**: Created proper RLS policies in the database schema:
- Policy for SELECT: Check if `auth.uid()` matches `user_id`
- Policy for INSERT: Check if `auth.uid()` matches `user_id`
- Policy for UPDATE: Check if `auth.uid()` matches `user_id`
- Policy for DELETE: Check if `auth.uid()` matches `user_id`

These policies ensure users can only access their own bookmarks while maintaining security.

### Problem 5: TypeScript Type Errors with Supabase

**Issue**: TypeScript complained about missing types for Supabase responses.

**Solution**: Created a `types/index.ts` file with proper interfaces:
- Defined `Bookmark` interface matching database schema
- Created `PaginatedResponse` for API responses
- Added `BookmarkInput` for creation/update operations

### Problem 6: Environment Variables Not Loading

**Issue**: Supabase client initialization failed because environment variables were undefined.

**Solution**:
1. Renamed `.env` to `.env.local` (Next.js convention)
2. Prefixed public variables with `NEXT_PUBLIC_`
3. Restarted development server after changes
4. Added `.env.local` to `.gitignore` to prevent committing secrets

### Problem 7: Pagination Not Resetting on Search

**Issue**: When searching, results would show page 2 or 3 with no data because search results had fewer pages.

**Solution**: Reset page to 1 whenever search term changes in `BookmarkList.tsx`:
```typescript
const handleSearch = (value: string) => {
  setSearch(value);
  setPage(1);  // Always go back to first page on new search
};
```

### Problem 8: CORS Issues During Development

**Issue**: API routes were being blocked by CORS when testing from different origins.

**Solution**: Next.js API routes automatically handle CORS for same-origin requests. For development, no additional configuration was needed since Next.js dev server serves both frontend and API from the same origin.

## API Endpoints

### GET /api/bookmarks
Retrieve paginated bookmarks with optional search.

Query params:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for title/URL

Response:
```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### POST /api/bookmarks
Create a new bookmark.

Body:
```json
{
  "url": "https://example.com",
  "title": "Example Site"
}
```

### DELETE /api/bookmarks/[id]
Delete a bookmark by ID.

### PATCH /api/bookmarks/[id]
Update a bookmark.

Body:
```json
{
  "url": "https://updated.com",
  "title": "Updated Title"
}
```

## Architecture Decisions

### Service Layer Pattern
Created `BookmarkService` class to separate business logic from API routes. This makes the code:
- More testable
- Easier to maintain
- Reusable across different routes
- Follows single responsibility principle

### Server-Side Authentication Check
Main page uses server component to check authentication before rendering. This:
- Prevents flash of unauthenticated content
- Improves security
- Reduces client-side JavaScript

### Real-time Subscriptions
Used Supabase Realtime instead of polling. Benefits:
- Instant updates across tabs
- Lower server load
- Better user experience
- Automatic cleanup on unmount

## Security Features

- Row Level Security (RLS) enforces data privacy
- Google OAuth only (no password storage)
- Server-side authentication checks
- Input validation on all API routes
- HTTPS required in production
- Environment variables for secrets

## Performance Optimizations

- Pagination to limit data transfer
- Database indexes on user_id and created_at
- Real-time subscriptions instead of polling
- Server-side rendering for initial page load
- Optimistic UI updates where applicable

## Future Enhancements

- Tags/categories for bookmarks
- Bookmark folders
- Import/export functionality
- Browser extension
- Bulk operations
- Sharing bookmarks with other users
- Full-text search
- Bookmark previews/screenshots

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
