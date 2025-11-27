-- ================================================
-- Threat Intelligence Database Setup Script
-- This script creates all necessary tables for the
-- Threat Intelligence Dashboard project.
-- Usage:
-- Get-Content database/setup.sql | docker exec -i postgres-threat-intel psql -U postgres -d threat_intelligence
-- ================================================

-- Drop existing tables (clean slate)
DROP TABLE IF EXISTS topic_embeddings CASCADE;
DROP TABLE IF EXISTS data_refresh_log CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS twitter_topics CASCADE;
DROP TABLE IF EXISTS hacker_news_trends CASCADE;
DROP TABLE IF EXISTS phishing_domains CASCADE;
DROP TABLE IF EXISTS cves CASCADE;

-- ================================================
-- 1. CVEs Table
-- ================================================
CREATE TABLE cves (
                      id SERIAL PRIMARY KEY,
                      cve_id VARCHAR(20) UNIQUE NOT NULL,
                      description TEXT,
                      severity VARCHAR(20),
                      cvss_score DECIMAL(3,1),
                      published_date TIMESTAMP,
                      modified_date TIMESTAMP,
                      vendor VARCHAR(255),
                      product VARCHAR(255),
                      "references" JSONB,
                      created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cves_severity ON cves(severity);
CREATE INDEX idx_cves_published ON cves(published_date DESC);
CREATE INDEX idx_cves_vendor ON cves(vendor);

-- ================================================
-- 2. Phishing Domains Table
-- ================================================
CREATE TABLE phishing_domains (
                                  id SERIAL PRIMARY KEY,
                                  domain VARCHAR(255) UNIQUE NOT NULL,
                                  url TEXT,
                                  source VARCHAR(50),
                                  status VARCHAR(20),
                                  reported_date TIMESTAMP,
                                  verified BOOLEAN DEFAULT FALSE,
                                  target VARCHAR(100),
                                  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_phishing_reported ON phishing_domains(reported_date DESC);
CREATE INDEX idx_phishing_status ON phishing_domains(status);

-- ================================================
-- 3. Hacker News Trends Table
-- ================================================
CREATE TABLE hacker_news_trends (
    id SERIAL PRIMARY KEY,
    hn_id VARCHAR(50) UNIQUE NOT NULL,     -- Hacker News story ID (objectID from Algolia API)
    title TEXT NOT NULL,                    -- Story title
    url TEXT,                               -- Story URL (can be null for Ask HN posts)
    author VARCHAR(255),                    -- Story author username
    points INTEGER DEFAULT 0,               -- Story points/votes
    num_comments INTEGER DEFAULT 0,         -- Number of comments
    tags TEXT[],                            -- Story tags from HN (e.g., story, show_hn, ask_hn)
    created_at_hn TIMESTAMP,               -- When the story was posted on Hacker News
    fetched_at TIMESTAMP DEFAULT NOW()     -- When our system fetched this story
);

CREATE INDEX idx_hn_created ON hacker_news_trends(created_at_hn DESC);
CREATE INDEX idx_hn_points ON hacker_news_trends(points DESC);
CREATE INDEX idx_hn_fetched ON hacker_news_trends(fetched_at DESC);
CREATE INDEX idx_hn_id ON hacker_news_trends(hn_id);

-- ================================================
-- 4. Data Refresh Log Table
-- ================================================
CREATE TABLE data_refresh_log (
                                  id SERIAL PRIMARY KEY,
                                  source VARCHAR(50),
                                  status VARCHAR(20),
                                  records_processed INTEGER,
                                  error_message TEXT,
                                  started_at TIMESTAMP,
                                  completed_at TIMESTAMP
);

-- ================================================
-- Verify Setup
-- ================================================
SELECT
    'Tables created successfully!' as message,
    (SELECT COUNT(*) FROM cves) as cves_count,
    (SELECT COUNT(*) FROM phishing_domains) as phishing_count,
    (SELECT COUNT(*) FROM hacker_news_trends) as hn_stories_count;

\dt