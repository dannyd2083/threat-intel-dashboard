import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '20';

        const result = await pool.query(
            `SELECT 
        cve_id,
        description,
        severity,
        cvss_score,
        published_date,
        vendor,
        product,
        created_at
       FROM cves 
       ORDER BY published_date DESC 
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
            { success: false, error: 'Failed to fetch CVEs' },
            { status: 500 }
        );
    }
}