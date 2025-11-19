import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '20';

        const result = await pool.query(
            `SELECT 
        domain,
        url,
        source,
        status,
        reported_date,
        target,
        created_at
       FROM phishing_domains 
       ORDER BY reported_date DESC 
       LIMIT $1`,
            [parseInt(limit)]
        );

        return NextResponse.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch phishing domains' },
            { status: 500 }
        );
    }
}