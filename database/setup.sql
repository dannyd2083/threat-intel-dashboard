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
                      references JSONB,
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
-- 3. Twitter Topics Table
-- ================================================
CREATE TABLE twitter_topics (
                                id SERIAL PRIMARY KEY,
                                hashtag VARCHAR(100) NOT NULL,
                                tweet_text TEXT,
                                tweet_id VARCHAR(50) UNIQUE,
                                author VARCHAR(100),
                                likes_count INTEGER DEFAULT 0,
                                retweets_count INTEGER DEFAULT 0,
                                posted_at TIMESTAMP,
                                category VARCHAR(50),
                                created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_twitter_hashtag ON twitter_topics(hashtag);
CREATE INDEX idx_twitter_posted ON twitter_topics(posted_at DESC);

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
    (SELECT COUNT(*) FROM twitter_topics) as twitter_count;

\dt