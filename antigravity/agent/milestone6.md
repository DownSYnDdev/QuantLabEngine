# Milestone 6: User Accounts, Persistence & Saved Layouts

## Objective
Implement the user system, authentication, saved layouts, saved indicators/strategies, and persistent storage. This milestone transforms QuantLab from a local sandbox into a personalized, cloud‑backed platform where users can save and restore their work.

---

## Tasks

### 1. Authentication System
- Implement secure user registration and login
- Use JWT or OAuth2 for session management
- Add password hashing (bcrypt or Argon2)
- Implement refresh tokens for long‑lived sessions
- Add rate limiting for login endpoints

---

### 2. User Profile & Settings
- Create user profile model:
  - Username
  - Email
  - Preferences (theme, chart defaults)
  - Default workspace layout
- Add endpoints for updating profile settings
- Add UI for editing user preferences

---

---

### 3. Tenant & Account Isolation
- Schema design must support multi-tenancy:
  - `users` table has `tenant_id` column.
  - `projects` table has `tenant_id` and `user_id` columns.
- Enforce Row-Level Security (RLS) or application-level checks to prevent cross-tenant data leakage.

---

### 4. Saved Layouts System
- Implement layout schema:
  - Chart configuration
  - Indicators attached to each chart
  - Timeframes
  - Symbol selections
  - Panel positions and sizes
- Add backend endpoints:
  - Save layout
  - Load layout
  - Delete layout
  - List all saved layouts
- Add UI:
  - “Save Layout” button
  - “Load Layout” modal
  - “Autosave” toggle

---

### 4. Saved Indicators & Strategies
- Implement storage for:
  - Custom indicators (DSL code)
  - Custom strategies (DSL code)
  - Metadata (name, description, tags)
- Add backend endpoints:
  - Save indicator/strategy
  - Load indicator/strategy
  - Delete indicator/strategy
  - Rename indicator/strategy
- Add UI:
  - Indicator/strategy library panel
  - Code editor integration
  - Versioning (optional)

---

### 5. Watchlists
- Implement watchlist schema:
  - Name
  - Symbols
  - Sorting preferences
- Add backend endpoints:
  - Create watchlist
  - Add/remove symbols
  - Delete watchlist
  - Rename watchlist
- Add UI:
  - Watchlist sidebar
  - Real‑time price updates
  - Drag‑and‑drop reordering

---

### 6. Database Integration
- Use PostgreSQL for persistent storage
- Use Redis for caching:
  - User sessions
  - Watchlist updates
  - Layout autosave buffers
- Add migrations for:
  - Users
  - Layouts
  - Indicators
  - Strategies
  - Watchlists

---

### 7. Security & Validation
- Input validation for all user‑submitted data
- Sanitization of DSL code before saving
- Enforce per‑user resource limits:
  - Max saved layouts
  - Max saved indicators/strategies
- Add audit logging for:
  - Logins
  - Saves
  - Deletes

---

## Deliverables
- Fully functional authentication system
- Persistent user profiles
- Tenant-isolated database schema
- Saved layouts with autosave support
- Saved indicators and strategies
- Watchlists with real‑time updates
- Database schema and migrations
- UI for managing all user‑related features

---

## Acceptance Criteria
- Users can register, log in, and stay logged in via refresh tokens
- Layouts persist across sessions and devices
- Indicators and strategies can be saved, loaded, and edited
- Watchlists update in real time and persist to the database
- All user data is validated, sanitized, and secure
- System passes basic penetration testing for auth endpoints

---

## Notes
- This milestone completes the “productization” layer of QuantLab.
- After this, Milestone 7 (Cloud Deployment) will make the platform production‑ready.
