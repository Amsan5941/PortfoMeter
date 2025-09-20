// Script to populate stock_symbols table with initial data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const stockSymbols = [
  { symbol: 'AAPL', company_name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Consumer Electronics', is_active: true },
  { symbol: 'MSFT', company_name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Software', is_active: true },
  { symbol: 'GOOGL', company_name: 'Alphabet Inc. Class A', exchange: 'NASDAQ', sector: 'Technology', industry: 'Internet Content & Information', is_active: true },
  { symbol: 'GOOG', company_name: 'Alphabet Inc. Class C', exchange: 'NASDAQ', sector: 'Technology', industry: 'Internet Content & Information', is_active: true },
  { symbol: 'AMZN', company_name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', industry: 'Internet Retail', is_active: true },
  { symbol: 'TSLA', company_name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', industry: 'Auto Manufacturers', is_active: true },
  { symbol: 'NVDA', company_name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors', is_active: true },
  { symbol: 'META', company_name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Social Media', is_active: true },
  { symbol: 'NFLX', company_name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', industry: 'Entertainment', is_active: true },
  { symbol: 'AMD', company_name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors', is_active: true },
  { symbol: 'CRM', company_name: 'Salesforce Inc.', exchange: 'NYSE', sector: 'Technology', industry: 'Software', is_active: true },
  { symbol: 'ORCL', company_name: 'Oracle Corporation', exchange: 'NYSE', sector: 'Technology', industry: 'Software', is_active: true },
  { symbol: 'INTC', company_name: 'Intel Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors', is_active: true },
  { symbol: 'IBM', company_name: 'International Business Machines Corporation', exchange: 'NYSE', sector: 'Technology', industry: 'IT Services', is_active: true },
  { symbol: 'ADBE', company_name: 'Adobe Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Software', is_active: true },
  { symbol: 'PYPL', company_name: 'PayPal Holdings Inc.', exchange: 'NASDAQ', sector: 'Financial Services', industry: 'Credit Services', is_active: true },
  { symbol: 'UBER', company_name: 'Uber Technologies Inc.', exchange: 'NYSE', sector: 'Industrials', industry: 'Railroads', is_active: true },
  { symbol: 'SPOT', company_name: 'Spotify Technology S.A.', exchange: 'NYSE', sector: 'Consumer Discretionary', industry: 'Entertainment', is_active: true },
  { symbol: 'SQ', company_name: 'Block Inc.', exchange: 'NYSE', sector: 'Technology', industry: 'Software', is_active: true },
  { symbol: 'ZM', company_name: 'Zoom Video Communications Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Software', is_active: true },
  { symbol: 'DOCU', company_name: 'DocuSign Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Software', is_active: true },
  { symbol: 'SNOW', company_name: 'Snowflake Inc.', exchange: 'NYSE', sector: 'Technology', industry: 'Software', is_active: true },
  { symbol: 'PLTR', company_name: 'Palantir Technologies Inc.', exchange: 'NYSE', sector: 'Technology', industry: 'Software', is_active: true },
  { symbol: 'ROKU', company_name: 'Roku Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', industry: 'Entertainment', is_active: true },
  { symbol: 'PINS', company_name: 'Pinterest Inc.', exchange: 'NYSE', sector: 'Technology', industry: 'Social Media', is_active: true },
  { symbol: 'SNAP', company_name: 'Snap Inc.', exchange: 'NYSE', sector: 'Technology', industry: 'Social Media', is_active: true },
  { symbol: 'TWTR', company_name: 'Twitter Inc.', exchange: 'NYSE', sector: 'Technology', industry: 'Social Media', is_active: true },
  { symbol: 'SHOP', company_name: 'Shopify Inc.', exchange: 'NYSE', sector: 'Technology', industry: 'Software', is_active: true },
  { symbol: 'WMT', company_name: 'Walmart Inc.', exchange: 'NYSE', sector: 'Consumer Staples', industry: 'Discount Stores', is_active: true },
  { symbol: 'JPM', company_name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial Services', industry: 'Banks', is_active: true },
  { symbol: 'BAC', company_name: 'Bank of America Corporation', exchange: 'NYSE', sector: 'Financial Services', industry: 'Banks', is_active: true },
  { symbol: 'WFC', company_name: 'Wells Fargo & Company', exchange: 'NYSE', sector: 'Financial Services', industry: 'Banks', is_active: true },
  { symbol: 'GS', company_name: 'Goldman Sachs Group Inc.', exchange: 'NYSE', sector: 'Financial Services', industry: 'Banks', is_active: true },
  { symbol: 'JNJ', company_name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Healthcare', industry: 'Pharmaceuticals', is_active: true },
  { symbol: 'PFE', company_name: 'Pfizer Inc.', exchange: 'NYSE', sector: 'Healthcare', industry: 'Pharmaceuticals', is_active: true },
  { symbol: 'UNH', company_name: 'UnitedHealth Group Incorporated', exchange: 'NYSE', sector: 'Healthcare', industry: 'Healthcare Plans', is_active: true },
  { symbol: 'ABBV', company_name: 'AbbVie Inc.', exchange: 'NYSE', sector: 'Healthcare', industry: 'Pharmaceuticals', is_active: true },
  { symbol: 'KO', company_name: 'The Coca-Cola Company', exchange: 'NYSE', sector: 'Consumer Staples', industry: 'Beverages', is_active: true },
  { symbol: 'PEP', company_name: 'PepsiCo Inc.', exchange: 'NASDAQ', sector: 'Consumer Staples', industry: 'Beverages', is_active: true },
  { symbol: 'PG', company_name: 'Procter & Gamble Company', exchange: 'NYSE', sector: 'Consumer Staples', industry: 'Household Products', is_active: true },
  { symbol: 'DIS', company_name: 'The Walt Disney Company', exchange: 'NYSE', sector: 'Consumer Discretionary', industry: 'Entertainment', is_active: true },
  { symbol: 'NKE', company_name: 'NIKE Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary', industry: 'Apparel', is_active: true },
  { symbol: 'HD', company_name: 'The Home Depot Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary', industry: 'Home Improvement Retail', is_active: true },
  { symbol: 'MCD', company_name: 'McDonald\'s Corporation', exchange: 'NYSE', sector: 'Consumer Discretionary', industry: 'Restaurants', is_active: true },
  { symbol: 'SBUX', company_name: 'Starbucks Corporation', exchange: 'NASDAQ', sector: 'Consumer Discretionary', industry: 'Restaurants', is_active: true },
  { symbol: 'BA', company_name: 'The Boeing Company', exchange: 'NYSE', sector: 'Industrials', industry: 'Aerospace & Defense', is_active: true },
  { symbol: 'CAT', company_name: 'Caterpillar Inc.', exchange: 'NYSE', sector: 'Industrials', industry: 'Construction & Mining', is_active: true },
  { symbol: 'GE', company_name: 'General Electric Company', exchange: 'NYSE', sector: 'Industrials', industry: 'Industrial Conglomerates', is_active: true },
  { symbol: 'XOM', company_name: 'Exxon Mobil Corporation', exchange: 'NYSE', sector: 'Energy', industry: 'Oil & Gas', is_active: true },
  { symbol: 'CVX', company_name: 'Chevron Corporation', exchange: 'NYSE', sector: 'Energy', industry: 'Oil & Gas', is_active: true },
  { symbol: 'COP', company_name: 'ConocoPhillips', exchange: 'NYSE', sector: 'Energy', industry: 'Oil & Gas', is_active: true },
  { symbol: 'SLB', company_name: 'Schlumberger Limited', exchange: 'NYSE', sector: 'Energy', industry: 'Oil & Gas', is_active: true },
  { symbol: 'V', company_name: 'Visa Inc.', exchange: 'NYSE', sector: 'Financial Services', industry: 'Credit Services', is_active: true },
  { symbol: 'MA', company_name: 'Mastercard Incorporated', exchange: 'NYSE', sector: 'Financial Services', industry: 'Credit Services', is_active: true },
  { symbol: 'AXP', company_name: 'American Express Company', exchange: 'NYSE', sector: 'Financial Services', industry: 'Credit Services', is_active: true },
];

async function populateStocks() {
  try {
    console.log('Starting to populate stock symbols...');
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('stock_symbols')
      .delete()
      .neq('id', 0); // Delete all rows
    
    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
    } else {
      console.log('Cleared existing stock symbols');
    }
    
    // Insert new data
    const { data, error } = await supabase
      .from('stock_symbols')
      .insert(stockSymbols);
    
    if (error) {
      console.error('Error inserting stock symbols:', error);
    } else {
      console.log(`Successfully inserted ${stockSymbols.length} stock symbols`);
    }
    
    // Verify the data
    const { data: count, error: countError } = await supabase
      .from('stock_symbols')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting records:', countError);
    } else {
      console.log(`Total records in stock_symbols table: ${count}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

populateStocks();

