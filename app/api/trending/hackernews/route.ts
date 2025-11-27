import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Stopwords for filtering uninteresting terms
const STOPWORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with',
    'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'her',
    'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
    'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
    'no', 'just', 'him', 'know', 'take', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'its', 'over', 'think',
    'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
    'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are',
    'been', 'has', 'had', 'were', 'said', 'did', 'having', 'may', 'should', 'am', 'being',
    'using', 'tell', 'more', 'less', 'via', 'part', 'says', 'come',
]);

// Hacker News metadata phrases to filter out
const HN_METADATA = new Set([
    'show hn', 'ask hn', 'tell hn', 'launch hn', 'hn show', 'hn ask', 'hn gecko',
]);

// Security-related keywords that make phrases more relevant
const SECURITY_KEYWORDS = new Set([
    'security', 'vulnerability', 'breach', 'exploit', 'attack', 'hack', 'hacker', 'malware',
    'ransomware', 'phishing', 'backdoor', 'zero-day', 'zeroday', 'patch', 'threat', 'leaked', 'exposure',
    'encryption', 'authentication', 'credentials', 'password', 'token', 'firewall', 'vpn',
    'ssl', 'tls', 'xss', 'injection', 'sqli', 'ddos', 'dos', 'botnet', 'spyware', 'trojan', 'worm',
    'rootkit', 'keylogger', 'data', 'privacy', 'gdpr', 'compliance', 'audit', 'forensics',
    'incident', 'response', 'disclosure', 'cve', 'cisa', 'nist', 'owasp', 'penetration',
    'testing', 'bug', 'bounty', 'flaw', 'fix', 'critical', 'severe', 'mitigation', 'pwn',
    'rce', 'lfi', 'rfi', 'csrf', 'idor', 'ssti', 'xxe', 'deserialization', 'api', 'iam',
]);

interface Story {
    title: string;
    points: number;
    num_comments: number;
    created_at_hn: Date;
}

/**
 * Calculate recency weight using exponential decay
 * Stories from today = 1.0, older stories decay exponentially
 * halfLifeDays determines how quickly scores decay
 */
function calculateRecencyWeight(storyDate: Date, now: Date, halfLifeDays: number = 14): number {
    const ageInDays = (now.getTime() - storyDate.getTime()) / (1000 * 60 * 60 * 24);
    // Exponential decay: weight = 2^(-age/halfLife)
    // Changed halfLife from 7 to 14 days to be less aggressive
    const weight = Math.pow(2, -ageInDays / halfLifeDays);
    // Ensure minimum weight of 0.05 so old stories aren't completely eliminated
    return Math.max(weight, 0.05);
}

/**
 * Extract meaningful security topics from story titles with recency weighting
 */
function extractSecurityTopics(stories: Story[], now: Date): Map<string, number> {
    const topicScores = new Map<string, number>();

    for (const story of stories) {
        const title = story.title;
        const recencyWeight = calculateRecencyWeight(new Date(story.created_at_hn), now);

        // Extract CVE IDs (e.g., CVE-2024-1234)
        const cveMatches = title.match(/CVE-\d{4}-\d+/gi);
        if (cveMatches) {
            for (const cve of cveMatches) {
                const score = (5 + (story.points / 10)) * recencyWeight;
                topicScores.set(cve.toUpperCase(), (topicScores.get(cve.toUpperCase()) || 0) + score);
            }
        }

        // Tokenize while preserving case
        const words = title.match(/[A-Za-z0-9][A-Za-z0-9\-.]*/g) || [];

        // Extract bigrams (2-word phrases)
        for (let i = 0; i < words.length - 1; i++) {
            const w1 = words[i];
            const w2 = words[i + 1];

            // Skip if both words are stopwords
            if (STOPWORDS.has(w1.toLowerCase()) && STOPWORDS.has(w2.toLowerCase())) {
                continue;
            }

            const bigram = `${w1} ${w2}`;
            const bigramLower = bigram.toLowerCase();

            // Skip HN metadata
            if (HN_METADATA.has(bigramLower)) {
                continue;
            }

            // Calculate relevance score with recency weighting
            const score = calculatePhraseScore(bigram, story.points) * recencyWeight;
            if (score > 0) {
                topicScores.set(bigram, (topicScores.get(bigram) || 0) + score);
            }
        }

        // Extract trigrams (3-word phrases) - often more meaningful
        for (let i = 0; i < words.length - 2; i++) {
            const w1 = words[i];
            const w2 = words[i + 1];
            const w3 = words[i + 2];

            // Skip if all three are stopwords
            if (STOPWORDS.has(w1.toLowerCase()) &&
                STOPWORDS.has(w2.toLowerCase()) &&
                STOPWORDS.has(w3.toLowerCase())) {
                continue;
            }

            const trigram = `${w1} ${w2} ${w3}`;
            const trigramLower = trigram.toLowerCase();

            // Skip if contains HN metadata
            if (trigramLower.includes('show hn') ||
                trigramLower.includes('ask hn') ||
                trigramLower.includes('tell hn') ||
                trigramLower.includes('launch hn')) {
                continue;
            }

            // Calculate relevance score with recency weighting
            const score = calculatePhraseScore(trigram, story.points) * recencyWeight * 1.5; // Bonus for longer phrases
            if (score > 0) {
                topicScores.set(trigram, (topicScores.get(trigram) || 0) + score);
            }
        }
    }

    return topicScores;
}

/**
 * Calculate relevance score for a phrase based on content and story points
 */
function calculatePhraseScore(phrase: string, storyPoints: number): number {
    const lower = phrase.toLowerCase();
    let score = 1;

    // Boost if contains security keywords
    const words = lower.split(/\s+/);
    const securityKeywordCount = words.filter(w => SECURITY_KEYWORDS.has(w)).length;
    if (securityKeywordCount > 0) {
        score += securityKeywordCount * 3;
    }

    // Boost for capitalized words (likely product names, companies, technologies)
    const capitalizedWords = phrase.match(/[A-Z][a-z]+/g);
    if (capitalizedWords && capitalizedWords.length > 0) {
        score += capitalizedWords.length * 2;
    }

    // Boost for all-caps acronyms (API, AWS, FBI, NSA, IAM, etc.)
    const acronyms = phrase.match(/\b[A-Z]{2,}\b/g);
    if (acronyms && acronyms.length > 0) {
        score += acronyms.length * 3;
    }

    // Boost for version numbers (1.0, 2.3.4)
    if (/\d+\.\d+/.test(phrase)) {
        score += 2;
    }

    // Boost for technical patterns like "pwn", "exploit", etc.
    if (/\b(pwn|0day|poc|rce|xss|sql|api|ci|cd|iam)\b/i.test(phrase)) {
        score += 2;
    }

    // Penalize if too many stopwords
    const stopwordCount = words.filter(w => STOPWORDS.has(w)).length;
    if (stopwordCount > words.length / 2) {
        score *= 0.4; // Less harsh penalty
    }

    // Penalize very short words (but less harsh)
    if (words.every(w => w.length < 4) && words.length <= 2) {
        score *= 0.7;
    }

    // Penalize generic words (but less harsh)
    if (/\b(every|modern|latest|simple|easy)\b/i.test(phrase)) {
        score *= 0.7;
    }

    // Factor in story popularity (logarithmic scale to avoid domination)
    const popularityBoost = Math.log10(storyPoints + 10) / 2;
    score *= (1 + popularityBoost);

    return score;
}

/**
 * Filter and clean extracted topics to show only the most meaningful ones
 */
function filterTopics(topicScores: Map<string, number>): [string, number][] {
    const topics = Array.from(topicScores.entries())
        .filter(([phrase, score]) => {
            const lower = phrase.toLowerCase();

            // Minimum score threshold (LOWERED from 2 to 0.5)
            if (score < 0.5) return false;

            // Skip HN metadata
            if (HN_METADATA.has(lower)) return false;

            // Skip if starts with or contains HN metadata
            if (lower.startsWith('show hn') ||
                lower.startsWith('ask hn') ||
                lower.startsWith('tell hn') ||
                lower.startsWith('launch hn') ||
                lower.startsWith('hn ')) return false;

            // Must have at least one non-stopword
            const words = lower.split(/\s+/);
            const hasContent = words.some(w => !STOPWORDS.has(w) && w.length > 2);
            if (!hasContent) return false;

            // Reject if just numbers
            if (/^\d+\s+\d+/.test(phrase)) return false;

            return true;
        })
        .sort((a, b) => b[1] - a[1]) // Sort by score descending
        .slice(0, 50); // Top 50

    return topics;
}

/**
 * GET /api/trending/hackernews?days=7
 *
 * Returns trending security topics from Hacker News with recency weighting
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '7');

        // Fetch recent HN stories with timestamps
        const result = await pool.query<Story>(
            `SELECT title, points, num_comments, created_at_hn
             FROM hacker_news_trends
             WHERE created_at_hn >= NOW() - INTERVAL '${days} days'
             ORDER BY created_at_hn DESC
             LIMIT 500`,
        );

        if (result.rows.length === 0) {
            // Fallback: if no data in time range, get the most recent 100 stories regardless of age
            console.log(`No stories found in last ${days} days, falling back to most recent stories`);
            const fallbackResult = await pool.query<Story>(
                `SELECT title, points, num_comments, created_at_hn
                 FROM hacker_news_trends
                 ORDER BY created_at_hn DESC
                 LIMIT 100`,
            );

            if (fallbackResult.rows.length === 0) {
                return NextResponse.json({
                    success: true,
                    data: [],
                    message: 'No Hacker News stories found in database'
                });
            }

            // Use fallback data
            const now = new Date();
            const topicScores = extractSecurityTopics(fallbackResult.rows, now);
            const filteredTopics = filterTopics(topicScores);

            const maxScore = filteredTopics[0]?.[1] || 1;
            const data = filteredTopics.map(([term, score]) => ({
                term,
                weight: Math.round((score / maxScore) * 100)
            }));

            return NextResponse.json({
                success: true,
                data,
                stats: {
                    storiesAnalyzed: fallbackResult.rows.length,
                    uniqueWords: topicScores.size,
                    topWords: data.length,
                    daysQueried: days,
                    warning: `No stories in last ${days} days, showing most recent ${fallbackResult.rows.length} stories`
                }
            });
        }

        // Extract meaningful topics with recency weighting
        const now = new Date();
        const topicScores = extractSecurityTopics(result.rows, now);
        const filteredTopics = filterTopics(topicScores);

        if (filteredTopics.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                message: 'No trending topics extracted from stories'
            });
        }

        // Normalize scores to 0-100 for frontend display
        const maxScore = filteredTopics[0]?.[1] || 1;
        const data = filteredTopics.map(([term, score]) => ({
            term,
            weight: Math.round((score / maxScore) * 100)
        }));

        return NextResponse.json({
            success: true,
            data,
            stats: {
                storiesAnalyzed: result.rows.length,
                uniqueWords: topicScores.size,
                topWords: data.length,
                daysQueried: days
            }
        });
    } catch (error) {
        console.error('Error fetching HN trending data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch trending Hacker News data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
