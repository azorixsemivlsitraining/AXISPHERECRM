# Fixing "body stream already read" Error on Fly.io

## Root Cause

The error occurs when Supabase client tries to parse a response body that has already been consumed. On Fly.io deployments, this happens because:

1. The Express/Vite server is running in production mode
2. Response bodies are being intercepted or consumed before Supabase client can read them
3. The Netlify redirects in `netlify.toml` don't apply to Fly.io, causing routing issues

## Solutions

### Solution 1: Use Server-Side Auth Proxy (Recommended for Fly.io)

The application now includes server-side auth routes that handle authentication, bypassing the client-side response body issue:

**Endpoints:**

- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-up` - Registration
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Check session

**Update `client/contexts/AuthContext.tsx` to use these endpoints:**

```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const { user, session } = await response.json();
    setUser(user);
    // Store session if needed
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
```

### Solution 2: Update Fly.io Deployment Configuration

Create `fly.toml` configuration:

```toml
[build]
  image = "node:20-alpine"

[env]
  VITE_SUPABASE_URL = "your-supabase-url"
  VITE_SUPABASE_ANON_KEY = "your-anon-key"

[[services]]
  protocol = "tcp"
  internal_port = 8080
  processes = ["app"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20
```

### Solution 3: Remove Netlify Configuration

If deploying to Fly.io, remove or update `netlify.toml`:

```toml
# Remove API redirects as Fly.io doesn't use Netlify Functions
[build]
  command = "npm run build"
  publish = "dist/spa"
```

## Testing Locally

1. Build the app:

   ```bash
   npm run build
   ```

2. Start production server:

   ```bash
   npm run start
   ```

3. Test authentication:
   - Go to `http://localhost:8080/register`
   - Create account
   - Login with credentials

## Deploying to Fly.io

1. Install Fly.io CLI:

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Set environment variables:

   ```bash
   fly secrets set VITE_SUPABASE_URL="your-url"
   fly secrets set VITE_SUPABASE_ANON_KEY="your-key"
   ```

3. Deploy:
   ```bash
   fly deploy
   ```

## Monitoring

Check logs on Fly.io:

```bash
fly logs -a your-app-name
```

## Alternative: Use a Different Deployment Platform

If Fly.io issues persist, consider:

- **Netlify**: Use the existing Netlify configuration
- **Vercel**: Update for Vercel deployment
- **AWS Amplify**: Native AWS integration

Choose the platform that best fits your needs.
