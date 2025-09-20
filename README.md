# PortfoMeter - AI-Powered Portfolio Review & Stock Insights

PortfoMeter is a web application that helps users understand and analyze their stock portfolios. Users can upload a screenshot of their portfolio, which is processed through OCR and AI to generate an educational portfolio review. The app also provides stock search, basic quote pages with charts, and a "popular" section highlighting top market movers and trending stocks.

## Features

- 🔐 **Authentication**: Secure user authentication with Clerk
- 📸 **Portfolio Upload**: Upload portfolio screenshots for AI analysis
- 🤖 **AI-Powered Reviews**: Get educational insights on your portfolio
- 🔍 **Stock Search**: Search and get real-time quotes for any stock
- 📊 **Market Movers**: Track top gainers, losers, and trending stocks
- 🛡️ **Privacy First**: Auto-delete uploaded images, secure data handling
- ⚠️ **Educational Only**: Clear disclaimers that this is not financial advice

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4o-mini
- **Market Data**: Alpha Vantage API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account
- OpenAI API key
- Alpha Vantage API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PortfoMeter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key_here

   # Market Data API (Alpha Vantage)
   MARKETDATA_API_KEY=your_alpha_vantage_api_key_here
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - Create a storage bucket named `portfolio-uploads` with public access
   - Set up Row Level Security policies as defined in the schema

5. **Set up Clerk**
   - Create a new Clerk application
   - Configure sign-in and sign-up URLs
   - Set up OAuth providers (Google, etc.) if desired

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── sign-in/          # Authentication pages
│   ├── sign-up/
│   └── api/              # API routes
├── components/           # Reusable React components
├── lib/                 # Utility functions and configurations
├── types/               # TypeScript type definitions
└── supabase/           # Database schema and migrations
```

## API Endpoints

- `POST /api/upload` - Upload portfolio screenshot
- `GET /api/stocks/quote?symbol=AAPL` - Get stock quote
- `GET /api/stocks/search?q=AAPL` - Search stocks
- `POST /api/portfolio/analyze` - Analyze portfolio

## Database Schema

The application uses the following main tables:

- `users` - User profiles linked to Clerk IDs
- `uploads` - Portfolio screenshot uploads
- `holdings` - Parsed portfolio holdings
- `stock_symbols` - Reference data for stock symbols
- `stock_quotes` - Cached stock price data
- `search_events` - User search tracking
- `market_movers` - Top gainers/losers data

## Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Supabase Setup

1. **Create storage bucket**
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('portfolio-uploads', 'portfolio-uploads', true);
   ```

2. **Set up storage policies**
   ```sql
   CREATE POLICY "Users can upload own files" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'portfolio-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

   CREATE POLICY "Users can view own files" ON storage.objects
   FOR SELECT USING (bucket_id = 'portfolio-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Development

### Adding New Features

1. Create new API routes in `src/app/api/`
2. Add new pages in `src/app/`
3. Create reusable components in `src/components/`
4. Update types in `src/types/`

### Database Migrations

1. Create migration files in `supabase/migrations/`
2. Run migrations in Supabase dashboard
3. Update TypeScript types in `src/types/database.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

**Important**: This application is for educational purposes only and does not provide financial advice. All portfolio reviews and stock insights are educational in nature. Please consult with a qualified financial advisor before making investment decisions.

## Support

For support, please open an issue in the GitHub repository or contact the development team.