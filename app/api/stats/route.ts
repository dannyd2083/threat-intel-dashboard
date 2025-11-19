import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM cves) as total_cves,
        (SELECT COUNT(*) FROM phishing_domains) as total_phishing,
        (SELECT COUNT(*) FROM cves WHERE severity = 'CRITICAL') as critical_cves,
        (SELECT COUNT(*) FROM cves WHERE severity = 'HIGH') as high_cves,
        (SELECT COUNT(*) FROM phishing_domains WHERE status = 'online') as active_phishing
    `);

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}