# Database Setup Instructions

## Quick Setup for PortfoMeter

### 1. Supabase Setup

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Run the database schema:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Click "Run" to execute the schema

3. **Create storage bucket:**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket named `portfolio-uploads`
   - Set it to public

4. **Update your .env.local:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

### 2. Clerk Setup

1. **Create a Clerk application:**
   - Go to [clerk.com](https://clerk.com)
   - Create a new application
   - Note down your publishable key and secret key

2. **Update your .env.local:**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   ```

### 3. API Keys (Optional for full functionality)

1. **OpenAI API Key:**
   - Get from [platform.openai.com](https://platform.openai.com)
   - Add to .env.local: `OPENAI_API_KEY=your_key_here`

2. **Alpha Vantage API Key:**
   - Get from [alphavantage.co](https://alphavantage.co)
   - Add to .env.local: `MARKETDATA_API_KEY=your_key_here`

### 4. Restart the development server

```bash
npm run dev
```

## Current Status

The application is currently running with **mock data** for demonstration purposes. Once you set up the database and API keys, it will use real data.

### What works now:
- ✅ Authentication (if Clerk is set up)
- ✅ Stock search with mock data
- ✅ Stock quotes with mock data
- ✅ Portfolio upload simulation
- ✅ All UI components

### What needs database setup:
- 🔄 Real stock data from database
- 🔄 Portfolio upload to storage
- 🔄 User data persistence
- 🔄 Search history tracking

## Troubleshooting

If you're still having issues:

1. **Check your .env.local file** - make sure all keys are correct
2. **Restart the dev server** after updating environment variables
3. **Check the browser console** for any error messages
4. **Check the terminal** for server-side errors

The application is designed to work with mock data even without the full setup, so you can test all features immediately!

