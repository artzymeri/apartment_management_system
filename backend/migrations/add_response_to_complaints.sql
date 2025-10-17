-- Add response column to complaints table
ALTER TABLE complaints
ADD COLUMN response TEXT NULL
COMMENT 'Property manager response when resolving/rejecting the complaint';

