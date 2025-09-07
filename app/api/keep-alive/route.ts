import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  const start = Date.now();

  try {
    await pool.query('SELECT 1');
    const end = Date.now();
    console.log(`[keep-alive] Ping successful (${end - start}ms) at ${new Date().toISOString()}`);
    
    return NextResponse.json({ 
      status: 'success', 
      responseTime: `${end - start}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") { console.error('[keep-alive] Ping failed:', error); }
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
