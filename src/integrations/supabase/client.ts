
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rtuzdeaxmpikwuvplcbh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dXpkZWF4bXBpa3d1dnBsY2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDYzMTIsImV4cCI6MjA1OTA4MjMxMn0.Ame9c-wN0mL45G_x01pcY0G1ryY1elR5LuUg7BWYJhU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create Supabase client with storage options
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web/2.49.4',
      },
    },
  }
);

// Explicitly set the bucket ID for consistency
export const RESUME_BUCKET_ID = 'resumes';

// Check if storage buckets are accessible
export const checkStorageBuckets = async () => {
  try {
    console.log('Checking storage buckets accessibility...');
    
    // First, try to directly access the resumes bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(RESUME_BUCKET_ID);
    
    if (!bucketError && bucketData) {
      console.log('Resumes bucket exists and is accessible via direct check:', bucketData);
      return { success: true };
    }
    
    console.log('Direct bucket check failed, trying to list buckets...');
    
    // If direct access fails, try listing all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return { success: false, error };
    }
    
    console.log('Available buckets:', buckets);
    
    // Check for the bucket with multiple possible identifiers
    const resumesBucketExists = buckets?.some(bucket => 
      bucket.name === 'Resumes Storage' || 
      bucket.id === RESUME_BUCKET_ID ||
      bucket.id.toLowerCase() === RESUME_BUCKET_ID.toLowerCase() ||
      bucket.name === RESUME_BUCKET_ID
    );
    
    if (!resumesBucketExists) {
      console.warn('Resumes bucket not found. Available buckets:', buckets?.map(b => `${b.id} (${b.name})`));
      return { 
        success: false, 
        error: new Error('Resumes bucket does not exist. File uploads will not work.')
      };
    } else {
      console.log('Resumes bucket exists and is accessible');
      return { success: true };
    }
  } catch (error) {
    console.error('Failed to check storage buckets:', error);
    return { success: false, error };
  }
};
