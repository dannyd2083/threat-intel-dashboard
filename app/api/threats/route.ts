import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ThreatItem } from '@/types/threat'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        const source = searchParams.get('source') || 'All'
        const days = parseInt(searchParams.get('days') || '7')
        const severity = searchParams.get('severity')
        const vendor = searchParams.get('vendor')


        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '10')
        const offset = (page - 1) * pageSize

        const results: ThreatItem[] = []
        let totalCount = 0


        if (source === 'All' || source === 'CVE') {
            let cveQuery = `
        SELECT 
          cve_id,
          description,
          severity,
          cvss_score,
          published_date,
          vendor,
          product,
          created_at
        FROM cves
        WHERE published_date >= NOW() - INTERVAL '${days} days'
      `


            let countQuery = `
        SELECT COUNT(*) as total
        FROM cves
        WHERE published_date >= NOW() - INTERVAL '${days} days'
      `

            const queryParams: any[] = []
            let paramIndex = 1

            if (severity && severity !== 'All') {
                const severityFilter = ` AND severity = $${paramIndex}`
                cveQuery += severityFilter
                countQuery += severityFilter
                queryParams.push(severity.toUpperCase())
                paramIndex++
            }

            if (vendor && vendor !== 'All') {
                const vendorFilter = ` AND vendor ILIKE $${paramIndex}`
                cveQuery += vendorFilter
                countQuery += vendorFilter
                queryParams.push(`%${vendor}%`)
                paramIndex++
            }

            cveQuery += ' ORDER BY published_date DESC'


            const countResult = await pool.query(countQuery, queryParams)
            totalCount += parseInt(countResult.rows[0].total)


            cveQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
            queryParams.push(pageSize, offset)

            const cveResult = await pool.query(cveQuery, queryParams)

            cveResult.rows.forEach((row: any) => {
                results.push({
                    id: row.cve_id,
                    type: 'CVE',
                    title: row.description?.substring(0, 100) || 'No description',
                    severity: row.severity || 'N/A',
                    date: row.published_date,
                    source: 'NVD',
                    cve_id: row.cve_id,
                    vendor: row.vendor || 'Unknown',
                    product: row.product || 'Unknown',
                    cvss_score: row.cvss_score,
                    description: row.description,
                })
            })
        }


        if (source === 'All' || source === 'Phishing') {
            const phishingQuery = `
        SELECT 
          domain,
          url,
          source,
          status,
          reported_date,
          target,
          created_at
        FROM phishing_domains
        WHERE reported_date >= NOW() - INTERVAL '${days} days'
        ORDER BY reported_date DESC
        LIMIT $1 OFFSET $2
      `

            const countQuery = `
        SELECT COUNT(*) as total
        FROM phishing_domains
        WHERE reported_date >= NOW() - INTERVAL '${days} days'
      `

            const countResult = await pool.query(countQuery)
            totalCount += parseInt(countResult.rows[0].total)

            const phishingResult = await pool.query(phishingQuery, [pageSize, offset])

            phishingResult.rows.forEach((row: any, index: number) => {
                results.push({
                    id: `PHISH-${offset + index + 1}`,
                    type: 'Phishing',
                    title: row.domain,
                    severity: row.status === 'online' ? 'HIGH' : 'MEDIUM',
                    date: row.reported_date,
                    source: row.source,
                    domain: row.domain,
                    url: row.url,
                    target: row.target,
                    status: row.status,
                })
            })
        }

        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return NextResponse.json({
            success: true,
            count: results.length,
            total: totalCount,
            page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
            data: results,
        })
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch threats' },
            { status: 500 }
        )
    }
}