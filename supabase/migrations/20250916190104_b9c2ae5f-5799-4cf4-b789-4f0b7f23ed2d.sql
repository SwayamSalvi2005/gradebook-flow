-- Enable leaked password protection
UPDATE auth.config SET value = 'true' WHERE name = 'LEAKED_PASSWORD_PROTECTION';