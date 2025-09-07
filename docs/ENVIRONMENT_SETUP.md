# Environment Variables for Production Deployment

## Required for Production

### Database
```
DATABASE_URL=your_neon_postgresql_connection_string
```

### Authentication
```
AUTH_SECRET=your_generated_secret_key_minimum_32_chars
NEXTAUTH_URL=https://yourapp.vercel.app
```

### OAuth Providers
```
# Google OAuth
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# GitHub OAuth  
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
```

### Email Service (for password reset)
```
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=DevMate <noreply@yourdomain.com>
```

### OpenAI/OpenRouter (optional)
```
OPENROUTER_API_KEY=your_openrouter_api_key
```

## How to Set Up

### 1. Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable above with their production values

### 2. Generate AUTH_SECRET
```bash
openssl rand -base64 32
```

### 3. Set up Email Service (Resend)
1. Sign up at https://resend.com
2. Verify your domain or use resend's domain for testing
3. Get your API key from the dashboard
4. Add RESEND_API_KEY to environment variables

### 4. OAuth Setup
- Google: https://console.developers.google.com
- GitHub: https://github.com/settings/applications/new

Set authorized redirect URIs to:
- `https://yourapp.vercel.app/api/auth/callback/google`
- `https://yourapp.vercel.app/api/auth/callback/github`

### 5. Database Setup
- Neon PostgreSQL connection string
- Ensure database is accessible from Vercel

## Security Notes
- Never commit .env files to git
- Use different secrets for production vs development
- Regularly rotate API keys and secrets
- Use domain verification for email sending in production
