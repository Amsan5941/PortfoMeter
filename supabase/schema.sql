-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Clerk IDs)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio uploads table
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size INTEGER,
  mime_type TEXT,
  ocr_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  ocr_results JSONB,
  ai_review JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holdings table (parsed from OCR)
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  company_name TEXT,
  quantity DECIMAL,
  price DECIMAL,
  cost_basis DECIMAL,
  market_value DECIMAL,
  confidence_score DECIMAL, -- OCR confidence (0-1)
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock symbols reference table
CREATE TABLE stock_symbols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  exchange TEXT,
  sector TEXT,
  industry TEXT,
  market_cap BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock quotes cache table
CREATE TABLE stock_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  price DECIMAL,
  change_amount DECIMAL,
  change_percent DECIMAL,
  volume BIGINT,
  market_cap BIGINT,
  pe_ratio DECIMAL,
  high_52w DECIMAL,
  low_52w DECIMAL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol)
);

-- Search events table (for trending stocks)
CREATE TABLE search_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  search_type TEXT DEFAULT 'symbol', -- symbol, company_name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market movers cache table
CREATE TABLE market_movers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  change_percent DECIMAL NOT NULL,
  change_amount DECIMAL NOT NULL,
  volume BIGINT,
  mover_type TEXT NOT NULL, -- gainer, loser
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol, date, mover_type)
);

-- Indexes for performance
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_holdings_upload_id ON holdings(upload_id);
CREATE INDEX idx_holdings_symbol ON holdings(symbol);
CREATE INDEX idx_search_events_user_id ON search_events(user_id);
CREATE INDEX idx_search_events_symbol ON search_events(symbol);
CREATE INDEX idx_search_events_created_at ON search_events(created_at);
CREATE INDEX idx_market_movers_date_type ON market_movers(date, mover_type);
CREATE INDEX idx_stock_quotes_symbol ON stock_quotes(symbol);
CREATE INDEX idx_stock_symbols_symbol ON stock_symbols(symbol);
CREATE INDEX idx_stock_symbols_active ON stock_symbols(is_active);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_events ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view own uploads" ON uploads
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert own uploads" ON uploads
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can view own holdings" ON holdings
  FOR SELECT USING (upload_id IN (
    SELECT id FROM uploads WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY "Users can insert own holdings" ON holdings
  FOR INSERT WITH CHECK (upload_id IN (
    SELECT id FROM uploads WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY "Users can view own search events" ON search_events
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert own search events" ON search_events
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Public read access for reference data
CREATE POLICY "Anyone can view stock symbols" ON stock_symbols
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view stock quotes" ON stock_quotes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view market movers" ON market_movers
  FOR SELECT USING (true);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uploads_updated_at BEFORE UPDATE ON uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_symbols_updated_at BEFORE UPDATE ON stock_symbols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
