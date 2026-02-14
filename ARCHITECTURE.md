# Architecture Documentation

## System Overview

The Smart Bookmark Manager is a full-stack application built with a modern serverless architecture. It leverages Next.js 14's App Router for both frontend and backend, Supabase for database and authentication, and Vercel for deployment.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ LoginButton │  │ BookmarkList │  │ Other Pages   │ │
│  └─────────────┘  └──────────────┘  └───────────────┘ │
└────────────┬────────────────────────────────────────────┘
             │
             │ HTTPS
             │
┌────────────▼────────────────────────────────────────────┐
│              Next.js 14 Application (Vercel)            │
│  ┌────────────────────────────────────────────────────┐ │
│  │              App Router Pages                      │ │
│  │  • page.tsx (home)                                 │ │
│  │  • layout.tsx (root layout)                        │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              API Routes                            │ │
│  │  • GET/POST /api/bookmarks                         │ │
│  │  • DELETE/PATCH /api/bookmarks/[id]                │ │
│  │  • GET /auth/callback                              │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Middleware Layer                         │ │
│  │  • Session refresh                                 │ │
│  │  • Auth state management                           │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Service Layer                            │ │
│  │  • BookmarkService (business logic)                │ │
│  │  • Validation utilities                            │ │
│  │  • Error handling                                  │ │
│  └────────────────────────────────────────────────────┘ │
└────────────┬───────────────────────────┬────────────────┘
             │                           │
             │                           │
┌────────────▼────────────┐  ┌──────────▼───────────────┐
│  Supabase Auth          │  │  Supabase Database       │
│  • Google OAuth         │  │  • PostgreSQL            │
│  • Session management   │  │  • Row Level Security    │
│  • JWT tokens           │  │  • Realtime subscriptions│
└─────────────────────────┘  └──────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **API**: Next.js API Routes (serverless functions)
- **Language**: TypeScript
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: Supabase Realtime

### Infrastructure
- **Hosting**: Vercel (serverless deployment)
- **Database**: Supabase (managed PostgreSQL)
- **CDN**: Vercel Edge Network

## Data Flow

### Authentication Flow

1. User clicks "Sign in with Google"
2. Client redirects to Google OAuth consent screen
3. User approves access
4. Google redirects to Supabase callback URL
5. Supabase exchanges code for session
6. Supabase redirects to `/auth/callback`
7. Callback route exchanges code for session in cookies
8. User redirected to home page
9. Middleware refreshes session on each request

### Bookmark Creation Flow

1. User fills form and clicks "Add Bookmark"
2. Client sends POST to `/api/bookmarks`
3. API route authenticates user via Supabase
4. Request validated (URL format, title length)
5. BookmarkService creates record in database
6. Database enforces RLS policies
7. Response returned to client
8. Real-time subscription fires UPDATE event
9. All open tabs receive event and refresh list

### Real-time Synchronization Flow

1. Component mounts, creates Supabase channel
2. Subscribes to `postgres_changes` on bookmarks table
3. Any INSERT/UPDATE/DELETE triggers callback
4. Callback fetches fresh data from API
5. Component re-renders with new data
6. Works across multiple browser tabs
7. Clean up subscription on unmount

## Security Architecture

### Row Level Security (RLS)

All database queries are filtered at the PostgreSQL level:

```sql
-- User can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);
```

This means even if someone tries to query another user's bookmarks directly, the database will return no results.

### Authentication Flow

1. Google OAuth handles user authentication
2. Supabase issues JWT tokens
3. Tokens stored in httpOnly cookies
4. Middleware refreshes tokens automatically
5. API routes verify tokens on each request
6. Invalid/expired tokens result in 401 error

### API Security

- All bookmark endpoints require authentication
- User ID extracted from verified JWT
- Input validation on all fields
- SQL injection prevented by parameterized queries
- XSS prevented by React's built-in escaping

## Database Schema

```sql
bookmarks
├── id (UUID, primary key)
├── user_id (UUID, foreign key → auth.users)
├── url (TEXT)
├── title (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Indexes:
- idx_bookmarks_user_id (user_id)
- idx_bookmarks_created_at (created_at DESC)

RLS Policies:
- Users can only access their own bookmarks
- All CRUD operations filtered by user_id
```

## Component Architecture

### Server Components
- `app/page.tsx`: Checks auth and renders appropriate UI
- `app/layout.tsx`: Provides global layout and metadata

Server components run on the server, reducing client JavaScript bundle size.

### Client Components
- `LoginButton.tsx`: Handles Google OAuth flow
- `BookmarkList.tsx`: Main UI with state management

Client components have access to browser APIs and can use hooks.

## Service Layer Pattern

The `BookmarkService` class encapsulates all bookmark-related business logic:

```typescript
class BookmarkService {
  - getBookmarks()     // Fetch with pagination
  - createBookmark()   // Create new bookmark
  - updateBookmark()   // Update existing
  - deleteBookmark()   // Delete by ID
  - getBookmark()      // Fetch single bookmark
}
```

Benefits:
- Reusable across different routes
- Testable in isolation
- Single source of truth for business rules
- Cleaner API route handlers

## Error Handling Strategy

### Three Levels of Error Handling

1. **Validation Layer**: Input validation before processing
   - URL format validation
   - Title length checks
   - Pagination parameter validation

2. **Service Layer**: Business logic errors
   - Database errors
   - Not found errors
   - Permission errors

3. **API Layer**: HTTP error responses
   - Consistent error format
   - Appropriate status codes
   - Error logging

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "statusCode": 400
}
```

## Performance Optimizations

### Database
- Indexes on frequently queried columns (user_id, created_at)
- Pagination to limit data transfer
- RLS policies push filtering to database layer
- Connection pooling via Supabase

### Frontend
- Server-side rendering for initial page load
- Real-time subscriptions instead of polling
- Lazy loading of components
- Optimized bundle size with tree shaking

### API
- Serverless functions scale automatically
- Edge network deployment via Vercel
- Minimal cold start time with Next.js

## Scalability Considerations

### Current Limits
- Supabase free tier: 500MB database, 2GB bandwidth
- Vercel free tier: 100GB bandwidth
- Real-time connections: Limited by Supabase plan

### Scaling Strategies
1. Upgrade Supabase plan for more connections
2. Add Redis cache for frequently accessed data
3. Implement cursor-based pagination for large datasets
4. Use Vercel Pro for higher bandwidth limits
5. Add CDN caching for static assets

## Development Workflow

### Local Development
1. Run Supabase locally (optional) or use cloud
2. `npm run dev` starts Next.js dev server
3. Hot reload on file changes
4. TypeScript type checking in real-time

### Deployment
1. Push to GitHub
2. Vercel auto-deploys on push to main
3. Preview deployments for pull requests
4. Production deployment on merge

## Monitoring and Observability

### Available Metrics
- Vercel Analytics: Page views, performance
- Supabase Dashboard: Query performance, database size
- Browser Console: Client-side errors
- Vercel Logs: Server-side errors and API logs

### Key Metrics to Track
- API response times
- Database query duration
- Error rates
- User authentication success rate
- Real-time connection count

## Testing Strategy

### Recommended Testing Approach
1. Unit tests for service layer
2. Integration tests for API routes
3. E2E tests for critical user flows
4. Manual testing before deployment

### Tools to Consider
- Jest for unit tests
- Playwright for E2E tests
- Supabase test database for integration tests

## Future Enhancements

### Short Term
- Bookmark editing UI
- Tags/categories
- Bulk operations
- Export functionality

### Long Term
- Browser extension
- Mobile app
- Shared bookmarks
- Full-text search
- AI-powered categorization
