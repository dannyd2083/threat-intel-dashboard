-- ================================================
-- Threat Intelligence Dashboard - Seed Data
-- ================================================
-- This file contains MOCK DATA for testing and development.
-- WARNING: Only use this for testing!
-- Real data from n8n workflows will populate these tables.
-- Usage (Windows):
-- Get-Content database/seed-data.sql | docker exec -i postgres-threat-intel psql -U postgres -d threat_intelligence
--
-- Usage (Mac/Linux):
-- cat database/seed-data.sql | docker exec -i postgres-threat-intel psql -U postgres -d threat_intelligence

-- Sample CVE Data
-- ================================================
INSERT INTO cves (cve_id, description, severity, cvss_score, published_date, vendor, product)
VALUES
    ('CVE-2024-0001', 'Critical vulnerability in authentication system', 'CRITICAL', 9.8, NOW() - INTERVAL '1 day', 'Microsoft', 'Windows Server'),
    ('CVE-2024-0002', 'SQL injection vulnerability in web application', 'HIGH', 8.6, NOW() - INTERVAL '2 days', 'Apache', 'Tomcat'),
    ('CVE-2024-0003', 'Cross-site scripting vulnerability', 'MEDIUM', 6.1, NOW() - INTERVAL '3 days', 'WordPress', 'Core')
    ON CONFLICT (cve_id) DO NOTHING;

-- ================================================
-- Sample Phishing Domains
-- ================================================
INSERT INTO phishing_domains (domain, url, source, status, reported_date, verified, target)
VALUES
    ('paypa1-secure.com', 'http://paypa1-secure.com/login', 'PhishTank', 'active', NOW() - INTERVAL '1 hour', true, 'PayPal'),
    ('microsft-update.com', 'http://microsft-update.com/verify', 'PhishTank', 'active', NOW() - INTERVAL '3 hours', true, 'Microsoft'),
    ('amazon-security.net', 'http://amazon-security.net/account', 'OpenPhish', 'active', NOW() - INTERVAL '5 hours', false, 'Amazon')
    ON CONFLICT (domain) DO NOTHING;

-- ================================================
-- Sample Twitter Topics (Mock Data with MOCK_ prefix)
-- ================================================
-- Note: tweet_id uses 'MOCK_' prefix so we can easily delete later:
-- DELETE FROM twitter_topics WHERE tweet_id LIKE 'MOCK_%';
-- ================================================
INSERT INTO twitter_topics (hashtag, tweet_text, tweet_id, author, likes_count, retweets_count, posted_at, category)
VALUES
    ('#FutureOfDefense', 'AI-powered defense systems are changing cybersecurity landscape', 'MOCK_001', 'securityexpert', 203, 45, NOW() - INTERVAL '2 hours', 'security'),
    ('#SecureTheGrid', 'Critical infrastructure protection remains vital in 2024', 'MOCK_002', 'analyst', 156, 32, NOW() - INTERVAL '4 hours', 'security'),
    ('#DarkWebWatch', 'New ransomware variant spotted on dark web forums', 'MOCK_003', 'researcher', 134, 28, NOW() - INTERVAL '6 hours', 'threat'),
    ('#CyberDesignSystem', 'Implementing secure by design principles in modern systems', 'MOCK_004', 'architect', 89, 20, NOW() - INTERVAL '8 hours', 'security'),
    ('#ZeroTrustArch', 'Zero trust framework implementation best practices', 'MOCK_005', 'engineer', 76, 18, NOW() - INTERVAL '10 hours', 'security'),
    ('#HackFreeFuture', 'Prevention strategies for modern cyber threats', 'MOCK_006', 'consultant', 98, 22, NOW() - INTERVAL '12 hours', 'security'),
    ('#CyberNova', 'Next-generation security tools and techniques', 'MOCK_007', 'developer', 67, 15, NOW() - INTERVAL '14 hours', 'security'),
    ('#DarkModeDefense', 'Dark web monitoring and threat analysis', 'MOCK_008', 'investigator', 112, 25, NOW() - INTERVAL '16 hours', 'threat'),
    ('#SecureByDesign', 'Security-first development practices gaining traction', 'MOCK_009', 'team', 45, 12, NOW() - INTERVAL '18 hours', 'security')
    ON CONFLICT (tweet_id) DO NOTHING;

-- ================================================
-- Verify Data Inserted
-- ================================================
SELECT
    'Sample data inserted!' as message,
    (SELECT COUNT(*) FROM cves) as cves_count,
    (SELECT COUNT(*) FROM phishing_domains) as phishing_count,
    (SELECT COUNT(*) FROM twitter_topics) as twitter_count;

-- ================================================
-- Quick cleanup command (if needed later):
-- DELETE FROM twitter_topics WHERE tweet_id LIKE 'MOCK_%';
-- ================================================