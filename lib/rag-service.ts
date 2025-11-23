import pool from './db';

interface CVERecord {
  cve_id: string;
  description: string;
  severity: string;
  cvss_score: number;
  published_date: string;
  vendor: string;
  product: string;
}

interface PhishingRecord {
  domain: string;
  url: string;
  source: string;
  status: string;
  reported_date: string;
  target: string;
}

interface StatisticsData {
  totalCVEs: number;
  totalPhishing: number;
  severityDistribution: { severity: string; count: number }[];
  vendorRanking: { vendor: string; count: number; critical_count: number }[];
  recentTrend: { date: string; count: number; critical_count: number }[];
  phishingTrend?: { date: string; count: number }[];
  timeRange: string;
}

interface RetrievalResult {
  cves: CVERecord[];
  phishing: PhishingRecord[];
  statistics?: StatisticsData;
  foundRelevantData: boolean;
  searchQuery: string;
  queryType: 'specific' | 'statistical' | 'mixed';
}

function detectQueryType(query: string): 'specific' | 'statistical' | 'mixed' {
  const statisticalKeywords = [
    'statistics', 'total count', 'how many', 'distribution', 'trend', 'growth', 
    'decline', 'compare', 'percentage', 'percent', 'most', 'least', 'average', 
    'summary', 'overview', 'ranking', 'rank by', 'breakdown by', 'each vendor'
  ];
  
  const specificKeywords = [
    'cve-', 'details', 'specific', 'what is', 'describe', 'impact', 'vulnerability name',
    'show me', 'give me', 'list of', 'what are', 'which are', 'cve id', 'cve ids',
    'examples', 'recent cves', 'latest cves'
  ];
  
  const queryLower = query.toLowerCase();
  
  const hasSpecific = specificKeywords.some(kw => queryLower.includes(kw)) || 
                      /cve[-_]?\d{4}[-_]?\d+/i.test(query) ||
                      (queryLower.includes('cve') && (queryLower.includes('show') || 
                       queryLower.includes('list') || queryLower.includes('give')));
  
  const hasStatistical = statisticalKeywords.some(kw => queryLower.includes(kw));
  
  if (hasStatistical && hasSpecific) return 'mixed';
  if (hasSpecific) return 'specific';
  if (hasStatistical) return 'statistical';
  return 'specific';
}

function shouldReturnAllVendors(query: string): boolean {
  const queryLower = query.toLowerCase();
  return queryLower.includes('each vendor') || 
         queryLower.includes('all vendor') ||
         queryLower.includes('every vendor') ||
         queryLower.includes('list of') ||
         queryLower.includes('breakdown');
}

function extractTimeRange(query: string): number {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('all') || queryLower.includes('entire') || 
      queryLower.includes('total') || queryLower.includes('database') ||
      queryLower.includes('every')) {
    return 36500;
  }
  
  const patterns = [
    { regex: /(\d+)\s*days?/i, multiplier: 1 },
    { regex: /(\d+)\s*weeks?/i, multiplier: 7 },
    { regex: /(\d+)\s*months?/i, multiplier: 30 },
    { regex: /(\d+)\s*years?/i, multiplier: 365 },
    { regex: /past\s+year|last\s+year/i, value: 365 },
    { regex: /past\s+(\d+)\s*years?/i, multiplier: 365 },
    { regex: /last\s+(\d+)\s*years?/i, multiplier: 365 },
    { regex: /past\s+month|last\s+month/i, value: 30 },
    { regex: /past\s+week|last\s+week/i, value: 7 },
    { regex: /this week/i, value: 7 },
    { regex: /this month/i, value: 30 },
    { regex: /this year/i, value: 365 },
    { regex: /recent/i, value: 7 },
    { regex: /lately/i, value: 7 },
  ];
  
  for (const pattern of patterns) {
    const match = query.match(pattern.regex);
    if (match) {
      if (pattern.value) return Math.max(1, Math.min(pattern.value, 36500));
      if (pattern.multiplier && match[1]) {
        const days = parseInt(match[1]) * pattern.multiplier;
        return Math.max(1, Math.min(days, 36500));
      }
    }
  }
  
  return 30;
}

function extractKeywords(query: string): string[] {
  const stopWords = [
    'what', 'how', 'why', 'when', 'where', 'who', 'which', 'whom', 'whose',
    'the', 'a', 'an', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'its', 'our', 'their',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
    'do', 'does', 'did', 'done', 'doing',
    'have', 'has', 'had', 'having',
    'can', 'could', 'may', 'might', 'must', 'will', 'would', 'shall', 'should',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'under', 'over', 'against', 'among',
    'and', 'or', 'but', 'so', 'yet', 'nor', 'if', 'than', 'because', 'since',
    'unless', 'while', 'although', 'though', 'whether',
    'tell', 'show', 'give', 'get', 'make', 'take', 'go', 'come', 'see', 'know',
    'think', 'want', 'need', 'like', 'use', 'used', 'find', 'help', 'try',
    'ask', 'work', 'seem', 'feel', 'become', 'leave', 'put', 'mean', 'keep',
    'let', 'begin', 'start', 'run', 'move', 'live', 'believe', 'bring',
    'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet',
    'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand',
    'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add',
    'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'consider',
    'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build',
    'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'suggest', 'raise',
    'something', 'anything', 'nothing', 'everything',
    'someone', 'anyone', 'everyone', 'nobody',
    'somewhere', 'anywhere', 'everywhere', 'nowhere',
    'time', 'person', 'year', 'way', 'day', 'thing', 'man', 'world', 'life',
    'hand', 'part', 'child', 'eye', 'woman', 'place', 'week', 'case',
    'point', 'government', 'company', 'number', 'group', 'problem', 'fact',
    'all', 'other', 'new', 'good', 'old', 'great', 'big', 'small',
    'different', 'large', 'next', 'early', 'young', 'important', 'few', 'public',
    'bad', 'same', 'able', 'only', 'just', 'also', 'even', 'very', 'much',
    'still', 'already', 'yet', 'never', 'always', 'often', 'sometimes', 'usually',
    'really', 'quite', 'almost', 'enough', 'too', 'more', 'most', 'less', 'least',
    'vulnerability', 'vulnerabilities', 'cve', 'cves', 'security', 'threat',
    'exploit', 'attack', 'issue', 'bug', 'flaw', 'weakness',
    'statistics', 'total', 'display', 'view', 'query', 'search', 'look',
    'looking', 'check', 'checking', 'id', 'ids', 'information', 'info',
    'data', 'details', 'detail', 'result', 'results', 'list', 'listing',
    'recent', 'latest', 'newest', 'current',
    'please', 'thanks', 'thank', 'sorry', 'excuse', 'hello', 'hi', 'hey',
    'situation', 'situations', 'example', 'examples',
    'scenario', 'scenarios', 'context', 'contexts', 'condition', 'conditions',
    'type', 'types', 'kind', 'kinds', 'sort', 'sorts',
    'etc', 'e.g.', 'i.e.',
  ];
  
  let keywords = query
    .toLowerCase()
    .replace(/[?!.,;:'"()\[\]{}<>]+/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.includes(word));

  const cvePattern = /cve[-_]?\d{4}[-_]?\d+/gi;
  const cveMatches = query.match(cvePattern);
  if (cveMatches) {
    keywords = [...keywords, ...cveMatches.map(id => id.toUpperCase())];
  }

  const vendors = [
    'microsoft', 'apple', 'google', 'adobe', 'cisco', 'oracle', 'linux', 
    'android', 'windows', 'chrome', 'firefox', 'safari', 'ibm', 'vmware', 
    'samsung', 'intel', 'amd', 'nvidia', 'dell', 'hp', 'lenovo', 'asus',
    'qualcomm', 'broadcom', 'redhat', 'ubuntu', 'debian', 'centos', 'fedora',
    'apache', 'nginx', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
    'gitlab', 'bitbucket', 'npm', 'python', 'java', 'nodejs', 'php', 'ruby'
  ];
  vendors.forEach(vendor => {
    if (query.toLowerCase().includes(vendor) && !keywords.includes(vendor)) {
      keywords.push(vendor);
    }
  });

  const severities = ['critical', 'high', 'medium', 'low'];
  severities.forEach(severity => {
    if (query.toLowerCase().includes(severity) && !keywords.includes(severity)) {
      keywords.push(severity);
    }
  });

  console.log('[RAG] Keywords before dedup:', keywords);
  const uniqueKeywords = [...new Set(keywords)];
  console.log('[RAG] Keywords after dedup:', uniqueKeywords);
  
  return uniqueKeywords;
}

async function retrieveCVEs(keywords: string[], limit: number = 10): Promise<CVERecord[]> {
  console.log('[RAG] retrieveCVEs called with keywords:', keywords, 'limit:', limit);
  
  if (keywords.length === 0) {
    const result = await pool.query(
      `SELECT cve_id, description, severity, cvss_score, 
              published_date, vendor, product
       FROM cves
       ORDER BY published_date DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  const severityKeywords = ['critical', 'high', 'medium', 'low'];
  const requestedSeverity = keywords.find(k => severityKeywords.includes(k.toLowerCase()));
  console.log('[RAG] Requested severity:', requestedSeverity);
  
  const vendorKeywords = [
    'microsoft', 'apple', 'google', 'adobe', 'cisco', 'oracle', 'linux', 
    'android', 'windows', 'ibm', 'vmware', 'samsung', 'intel', 'amd', 'nvidia',
    'dell', 'hp', 'lenovo', 'asus', 'qualcomm', 'broadcom', 'redhat', 'ubuntu',
    'debian', 'centos', 'fedora', 'apache', 'nginx', 'mysql', 'postgresql',
    'mongodb', 'redis', 'elasticsearch', 'aws', 'azure', 'gcp', 'docker',
    'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'bitbucket',
    'npm', 'python', 'java', 'nodejs', 'php', 'ruby'
  ];
  const requestedVendor = keywords.find(k => vendorKeywords.includes(k.toLowerCase()));
  console.log('[RAG] Requested vendor:', requestedVendor);
  
  const searchKeywords = keywords.filter(k => 
    !severityKeywords.includes(k.toLowerCase()) && 
    !vendorKeywords.includes(k.toLowerCase()) &&
    isNaN(parseInt(k))
  );
  console.log('[RAG] Search keywords:', searchKeywords);

  let queryParts = [];
  let queryParams: any[] = [];
  let paramCounter = 1;

  if (requestedSeverity) {
    queryParts.push(`severity = $${paramCounter}`);
    queryParams.push(requestedSeverity.toUpperCase());
    paramCounter++;
    console.log('[RAG] Added severity filter:', requestedSeverity.toUpperCase());
  }

  if (requestedVendor) {
    queryParts.push(`vendor ILIKE $${paramCounter}`);
    queryParams.push(`%${requestedVendor}%`);
    paramCounter++;
    console.log('[RAG] Added vendor filter:', `%${requestedVendor}%`);
  }

  if (searchKeywords.length > 0 && !requestedVendor && !requestedSeverity) {
    const searchConditions = searchKeywords.map((keyword, index) => {
      const paramIndex = paramCounter + index;
      return `(
        cve_id ILIKE $${paramIndex} OR
        description ILIKE $${paramIndex} OR
        vendor ILIKE $${paramIndex} OR
        product ILIKE $${paramIndex}
      )`;
    }).join(' OR ');
    
    if (searchConditions) {
      queryParts.push(`(${searchConditions})`);
      queryParams.push(...searchKeywords.map(k => `%${k}%`));
      paramCounter += searchKeywords.length;
    }
  }

  const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';

  const query = `
    SELECT cve_id, description, severity, cvss_score, 
           published_date, vendor, product
    FROM cves
    ${whereClause}
    ORDER BY 
      CASE 
        WHEN severity = 'CRITICAL' THEN 1
        WHEN severity = 'HIGH' THEN 2
        WHEN severity = 'MEDIUM' THEN 3
        WHEN severity = 'LOW' THEN 4
        ELSE 5
      END,
      published_date DESC
    LIMIT $${paramCounter}
  `;

  queryParams.push(limit);

  console.log('[RAG] Final SQL Query:', query);
  console.log('[RAG] Final Query Params:', queryParams);

  try {
    const result = await pool.query(query, queryParams);
    console.log('[RAG] Query returned', result.rows.length, 'CVEs');
    if (result.rows.length > 0) {
      console.log('[RAG] Sample CVE:', result.rows[0].cve_id, result.rows[0].vendor, result.rows[0].severity);
    }
    return result.rows;
  } catch (error) {
    console.error('[RAG] CVE retrieval error:', error);
    console.error('[RAG] Failed query:', query);
    console.error('[RAG] Failed params:', queryParams);
    return [];
  }
}

async function retrievePhishing(keywords: string[], includeAll: boolean = false): Promise<PhishingRecord[]> {
  if (includeAll) {
    const query = `
      SELECT domain, url, source, status, reported_date, target
      FROM phishing_domains
      ORDER BY reported_date DESC
      LIMIT 10
    `;
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('[RAG] Phishing query error:', error);
      return [];
    }
  }

  if (keywords.length === 0) {
    return [];
  }

  const searchConditions = keywords.map((keyword, index) => {
    return `(
      domain ILIKE $${index + 1} OR
      url ILIKE $${index + 1} OR
      target ILIKE $${index + 1} OR
      source ILIKE $${index + 1}
    )`;
  }).join(' OR ');

  const searchValues = keywords.map(k => `%${k}%`);

  const query = `
    SELECT domain, url, source, status, reported_date, target
    FROM phishing_domains
    WHERE ${searchConditions}
    ORDER BY reported_date DESC
    LIMIT 10
  `;

  try {
    const result = await pool.query(query, searchValues);
    return result.rows.length > 0 ? result.rows : [];
  } catch (error) {
    console.error('[RAG] Phishing query error:', error);
    return [];
  }
}

async function getSeverityDistribution(days: number, vendor?: string): Promise<{ severity: string; count: number }[]> {
  let query = `
    SELECT 
      COALESCE(severity, 'UNKNOWN') as severity,
      COUNT(*) as count
    FROM cves
    WHERE published_date >= NOW() - ($1 || ' days')::INTERVAL
  `;
  
  const params: any[] = [days];
  if (vendor) {
    query += ` AND vendor ILIKE $2`;
    params.push(`%${vendor}%`);
  }
  
  query += ` GROUP BY severity ORDER BY 
    CASE severity
      WHEN 'CRITICAL' THEN 1
      WHEN 'HIGH' THEN 2
      WHEN 'MEDIUM' THEN 3
      WHEN 'LOW' THEN 4
      ELSE 5
    END`;
  
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('[RAG] Severity distribution query error:', error);
    return [];
  }
}

async function getVendorRanking(days: number, limit: number = 10): Promise<{ vendor: string; count: number; critical_count: number }[]> {
  const query = `
    SELECT 
      vendor,
      COUNT(*) as count,
      SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical_count
    FROM cves
    WHERE published_date >= NOW() - ($1 || ' days')::INTERVAL
      AND vendor IS NOT NULL
      AND vendor != ''
    GROUP BY vendor
    ORDER BY count DESC, critical_count DESC
    LIMIT $2
  `;
  
  try {
    const result = await pool.query(query, [days, limit]);
    return result.rows;
  } catch (error) {
    console.error('[RAG] Vendor ranking query error:', error);
    return [];
  }
}

async function getTimeTrend(days: number, vendor?: string): Promise<{ date: string; count: number; critical_count: number }[]> {
  let query = `
    SELECT 
      DATE(published_date) as date,
      COUNT(*) as count,
      SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical_count
    FROM cves
    WHERE published_date >= NOW() - ($1 || ' days')::INTERVAL
  `;
  
  const params: any[] = [days];
  if (vendor) {
    query += ` AND vendor ILIKE $2`;
    params.push(`%${vendor}%`);
  }
  
  query += ` GROUP BY DATE(published_date) ORDER BY date DESC LIMIT 30`;
  
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('[RAG] Time trend query error:', error);
    return [];
  }
}

async function getPhishingStats(days: number): Promise<{ total: number; trend: { date: string; count: number }[] }> {
  try {
    const totalQuery = `
      SELECT COUNT(*) as total 
      FROM phishing_domains 
      WHERE reported_date >= NOW() - ($1 || ' days')::INTERVAL
    `;
    
    const trendQuery = `
      SELECT 
        DATE(reported_date) as date,
        COUNT(*) as count
      FROM phishing_domains
      WHERE reported_date >= NOW() - ($1 || ' days')::INTERVAL
      GROUP BY DATE(reported_date)
      ORDER BY date DESC
      LIMIT 30
    `;
    
    const [totalResult, trendResult] = await Promise.all([
      pool.query(totalQuery, [days]),
      pool.query(trendQuery, [days])
    ]);
    
    return {
      total: parseInt(totalResult.rows[0]?.total || '0'),
      trend: trendResult.rows
    };
  } catch (error) {
    console.error('[RAG] Phishing stats query error:', error);
    return { total: 0, trend: [] };
  }
}

async function getStatistics(days: number, vendor?: string, vendorLimit: number = 10): Promise<StatisticsData> {
  const timeRange = days >= 36500 ? 'all time' : `${days} days`;
  
  const [totalResult, severityDist, vendorRank, timeTrend, phishingStats] = await Promise.all([
    pool.query(
      vendor 
        ? `SELECT COUNT(*) as total FROM cves WHERE published_date >= NOW() - ($1 || ' days')::INTERVAL AND vendor ILIKE $2`
        : `SELECT COUNT(*) as total FROM cves WHERE published_date >= NOW() - ($1 || ' days')::INTERVAL`,
      vendor ? [days, `%${vendor}%`] : [days]
    ),
    getSeverityDistribution(days, vendor),
    getVendorRanking(days, vendorLimit),
    getTimeTrend(days, vendor),
    getPhishingStats(days)
  ]);
  
  return {
    totalCVEs: parseInt(totalResult.rows[0]?.total || '0'),
    totalPhishing: phishingStats.total,
    severityDistribution: severityDist,
    vendorRanking: vendorRank,
    recentTrend: timeTrend,
    phishingTrend: phishingStats.trend,
    timeRange
  };
}

export async function retrieveRelevantData(userQuery: string): Promise<RetrievalResult> {
  console.log('[RAG] User query:', userQuery);
  
  try {
    const queryType = detectQueryType(userQuery);
    console.log('[RAG] Query type:', queryType);
    
    const keywords = extractKeywords(userQuery);
    const timeRange = extractTimeRange(userQuery);
    console.log('[RAG] Extracted keywords:', keywords);
    console.log('[RAG] Time range:', timeRange, 'days');
    
    const vendorKeyword = keywords.find(kw => 
      ['microsoft', 'apple', 'google', 'adobe', 'cisco', 'oracle', 'linux', 'android', 'windows'].includes(kw.toLowerCase())
    );

    const requestedCount = parseInt(keywords.find(k => !isNaN(parseInt(k))) || '10');
    const cveLimit = Math.min(Math.max(requestedCount, 5), 50);
    console.log('[RAG] Requested count:', requestedCount, '→ Limit:', cveLimit);

    let cves: CVERecord[] = [];
    let phishing: PhishingRecord[] = [];
    let statistics: StatisticsData | undefined;

    const queryLower = userQuery.toLowerCase();
    const isPhishingQuery = queryLower.includes('phishing') || queryLower.includes('phish') || 
                           queryLower.includes('domain') || queryLower.includes('fraud');
    const needAllVendors = shouldReturnAllVendors(userQuery);
    const vendorLimit = needAllVendors ? 50 : 10;

    if (queryType === 'statistical') {
      console.log('[RAG] Executing statistical query');
      console.log('[RAG] Vendor limit:', vendorLimit);
      
      statistics = await getStatistics(timeRange, vendorKeyword, vendorLimit);
      
      if (isPhishingQuery) {
        phishing = await retrievePhishing(keywords, true);
      }
      
      if (userQuery.includes('ranking') || userQuery.includes('top')) {
        const topVendor = statistics.vendorRanking[0]?.vendor;
        if (topVendor) {
          cves = await retrieveCVEs([topVendor], 5);
        }
      }
    } else if (queryType === 'mixed') {
      console.log('[RAG] Executing mixed query');
      [cves, phishing, statistics] = await Promise.all([
        retrieveCVEs(keywords, cveLimit),
        retrievePhishing(keywords, isPhishingQuery),
        getStatistics(timeRange, vendorKeyword, vendorLimit)
      ]);
    } else {
      console.log('[RAG] Executing specific query');
      [cves, phishing] = await Promise.all([
        retrieveCVEs(keywords, cveLimit),
        retrievePhishing(keywords, isPhishingQuery)
      ]);
      
      if (cves.length > 5) {
        statistics = await getStatistics(timeRange, vendorKeyword, vendorLimit);
      }
    }

    console.log(`[RAG] Found ${cves.length} CVEs, ${phishing.length} phishing records`);
    if (statistics) {
      console.log(`[RAG] Statistics: ${statistics.totalCVEs} total CVEs in ${statistics.timeRange}`);
    }

    return {
      cves,
      phishing,
      statistics,
      foundRelevantData: cves.length > 0 || phishing.length > 0 || !!statistics,
      searchQuery: keywords.join(', '),
      queryType
    };
  } catch (error) {
    console.error('[RAG] Retrieval error:', error);
    return {
      cves: [],
      phishing: [],
      foundRelevantData: false,
      searchQuery: '',
      queryType: 'specific'
    };
  }
}

export function formatContextForLLM(result: RetrievalResult): string {
  if (!result.foundRelevantData) {
    return 'Database retrieval result: No relevant threat intelligence data found.';
  }

  let context = '## Database Retrieval Results\n\n';
  context += `**Query Type**: ${result.queryType === 'statistical' ? 'Statistical Analysis' : result.queryType === 'mixed' ? 'Mixed Query' : 'Specific Query'}\n`;
  context += `**Search Keywords**: ${result.searchQuery}\n\n`;

  if (result.statistics) {
    context += '### 📊 Statistical Analysis\n\n';
    
    context += `**Time Range**: ${result.statistics.timeRange}\n`;
    context += `**Total CVEs**: ${result.statistics.totalCVEs}\n`;
    context += `**Total Phishing Domains**: ${result.statistics.totalPhishing}\n\n`;
    
    if (result.statistics.severityDistribution.length > 0) {
      context += '#### Severity Distribution\n\n';
      result.statistics.severityDistribution.forEach(item => {
        const percentage = result.statistics!.totalCVEs > 0 
          ? ((item.count / result.statistics!.totalCVEs) * 100).toFixed(1)
          : '0.0';
        context += `- **${item.severity}**: ${item.count} (${percentage}%)\n`;
      });
      context += '\n';
    }
    
    if (result.statistics.vendorRanking.length > 0) {
      const topLabel = result.statistics.vendorRanking.length > 10 
        ? `(Top ${result.statistics.vendorRanking.length})` 
        : '(Top 10)';
      context += `#### Affected Vendor Ranking ${topLabel}\n\n`;
      
      result.statistics.vendorRanking.forEach((item, index) => {
        context += `${index + 1}. **${item.vendor}**: ${item.count} CVEs`;
        if (item.critical_count > 0) {
          context += ` (${item.critical_count} critical)`;
        }
        context += '\n';
      });
      context += '\n';
    }
    
    if (result.statistics.recentTrend.length > 0) {
      context += '#### CVE Trend (Daily Statistics)\n\n';
      const recentDays = result.statistics.recentTrend.slice(0, 7);
      recentDays.forEach(item => {
        const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        context += `- **${date}**: ${item.count} vulnerabilities`;
        if (item.critical_count > 0) {
          context += ` (${item.critical_count} critical)`;
        }
        context += '\n';
      });
      context += '\n';
    }
    
    if (result.statistics.phishingTrend && result.statistics.phishingTrend.length > 0) {
      context += '#### Phishing Trend (Daily Statistics)\n\n';
      const recentDays = result.statistics.phishingTrend.slice(0, 7);
      recentDays.forEach(item => {
        const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        context += `- **${date}**: ${item.count} phishing domains\n`;
      });
      context += '\n';
    }
  }

  if (result.cves.length > 0) {
    const queryLower = result.searchQuery.toLowerCase();
    const wantsCVEList = queryLower.includes('cve id') || queryLower.includes('cve ids') || 
                        queryLower.includes('list') || queryLower.includes('what are');
    
    if (wantsCVEList && result.cves.length > 0) {
      context += '### 🎯 CVE IDs Found\n\n';
      result.cves.forEach((cve, index) => {
        context += `${index + 1}. **${cve.cve_id}** - ${cve.severity || 'N/A'} (CVSS: ${cve.cvss_score || 'N/A'})\n`;
      });
      context += '\n';
    }
    
    context += '### 🔍 CVE Vulnerability Details\n\n';
    result.cves.forEach((cve, index) => {
      context += `#### ${index + 1}. ${cve.cve_id}\n\n`;
      context += `- **Severity**: ${cve.severity || 'N/A'}\n`;
      context += `- **CVSS Score**: ${cve.cvss_score || 'N/A'}\n`;
      context += `- **Affected Vendor**: ${cve.vendor || 'N/A'}\n`;
      context += `- **Affected Product**: ${cve.product || 'N/A'}\n`;
      context += `- **Published Date**: ${cve.published_date ? new Date(cve.published_date).toLocaleDateString('en-US') : 'N/A'}\n`;
      context += `- **Description**: ${cve.description || 'N/A'}\n\n`;
    });
  }

  if (result.phishing.length > 0) {
    context += '### 🎣 Phishing Domain Information\n\n';
    result.phishing.forEach((phish, index) => {
      context += `**${index + 1}. ${phish.domain}**\n`;
      context += `- **URL**: ${phish.url || 'N/A'}\n`;
      context += `- **Status**: ${phish.status || 'N/A'}\n`;
      context += `- **Source**: ${phish.source || 'N/A'}\n`;
      context += `- **Target Brand**: ${phish.target || 'N/A'}\n`;
      context += `- **Reported Date**: ${phish.reported_date ? new Date(phish.reported_date).toLocaleDateString('en-US') : 'N/A'}\n\n`;
    });
  }

  return context;
}