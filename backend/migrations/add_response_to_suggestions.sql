-- Add response column to suggestions table
ALTER TABLE suggestions
ADD COLUMN response TEXT NULL
COMMENT 'Property manager response when resolving/rejecting the suggestion';

