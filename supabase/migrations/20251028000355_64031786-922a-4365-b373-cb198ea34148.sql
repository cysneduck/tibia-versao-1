-- Make ticket-screenshots bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'ticket-screenshots';