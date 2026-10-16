# Developer Reflection Template

*Instructions: This is a personalized reflection template for the Insigra Reports practical task. Review and adjust the three points below based on your personal development experience before submitting.*

---

### 1. What Was Difficult
> "The most challenging aspect was ensuring the security boundary strictly existed inside PostgreSQL rather than taking shortcuts in React, specifically setting up the subquery policy in Row-Level Security while preventing recursion and properly handling the `@supabase/ssr` cookie-based session lifecycle in Next.js Server Components and Middleware."

### 2. What Was Learned
> "I deepened my practical understanding of defense-in-depth: why client-side authorization parameters (`?company_name=eq.Alpha`) are a severe vulnerability, how PostgreSQL parses `auth.uid()` from signed JWT bearer tokens during query execution, and how to write clean, type-safe Next.js App Router code that gracefully handles missing configuration and edge cases."

### 3. What Could Be Improved
> "In a full production platform, I would implement multi-tenant Role-Based Access Control (RBAC) so companies can invite team members with granular roles (Admin vs. Analyst), create automated CI/CD database migration pipelines via the Supabase CLI, and add automated end-to-end Playwright tests running against isolated test schemas."
