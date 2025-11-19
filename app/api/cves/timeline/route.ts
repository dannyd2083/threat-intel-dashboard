import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = searchParams.get('days') || '30';

        const result = await pool.query(
            `SELECT 
        DATE(published_date) as date,
        COUNT(*) as count
       FROM cves 
       WHERE published_date >= NOW() - INTERVAL '${parseInt(days)} days'
       GROUP BY DATE(published_date)
       ORDER BY date ASC`,
        );

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch CVE timeline' },
            { status: 500 }
        );
    }
}