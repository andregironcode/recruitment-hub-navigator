import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins in development
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
    }
    
    const response = await fetch('https://rtuzdeaxmpikwuvplcbh.supabase.co/functions/v1/analyze-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase Edge Function error:', errorText);
      throw new Error(`Supabase Edge Function returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    console.error('Error in analyze-resume proxy:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze resume' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
} 