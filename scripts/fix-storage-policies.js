// Script to fix Supabase storage policies
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStoragePolicies() {
  try {
    console.log('Fixing storage policies...');
    
    // First, let's check the current bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    const portfolioBucket = buckets.find(b => b.name === 'portfolio-uploads');
    if (!portfolioBucket) {
      console.error('portfolio-uploads bucket not found');
      return;
    }
    
    console.log('Found portfolio-uploads bucket:', portfolioBucket);
    
    // The issue is that the bucket is public but we need RLS policies
    // Let's create a simple test upload to see what happens
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const fileName = `test-${Date.now()}.txt`;
    
    console.log('Testing upload...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-uploads')
      .upload(fileName, testFile);
    
    if (uploadError) {
      console.error('Upload test failed:', uploadError);
      
      // If it's an RLS error, we need to fix the policies
      if (uploadError.message.includes('row-level security')) {
        console.log('\n=== RLS Policy Issue Detected ===');
        console.log('The bucket has RLS enabled but the policies are not working correctly.');
        console.log('\nTo fix this, you need to:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Storage > portfolio-uploads bucket');
        console.log('3. Go to the Policies tab');
        console.log('4. Delete all existing policies');
        console.log('5. Create these new policies:');
        console.log('\n--- Policy 1: Allow authenticated users to upload ---');
        console.log('Name: Allow authenticated uploads');
        console.log('Operation: INSERT');
        console.log('Target roles: authenticated');
        console.log('USING expression: auth.uid() is not null');
        console.log('WITH CHECK expression: true');
        console.log('\n--- Policy 2: Allow users to view their own files ---');
        console.log('Name: Allow users to view own files');
        console.log('Operation: SELECT');
        console.log('Target roles: authenticated');
        console.log('USING expression: auth.uid() = owner');
        console.log('\n--- Policy 3: Allow users to delete their own files ---');
        console.log('Name: Allow users to delete own files');
        console.log('Operation: DELETE');
        console.log('Target roles: authenticated');
        console.log('USING expression: auth.uid() = owner');
        console.log('\nAlternatively, you can temporarily disable RLS:');
        console.log('1. Go to Storage > portfolio-uploads');
        console.log('2. Click on the bucket settings');
        console.log('3. Toggle OFF "Enable RLS"');
        console.log('4. Save changes');
      }
    } else {
      console.log('Upload test successful:', uploadData);
      
      // Clean up test file
      await supabase.storage
        .from('portfolio-uploads')
        .remove([fileName]);
      console.log('Test file cleaned up');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixStoragePolicies();

