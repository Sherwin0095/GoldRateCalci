USE golddata;
-- Ensure the table exists before querying
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'gold_products')
BEGIN
	-- Query the table if it exists
	SELECT * FROM gold_products;
END
ELSE
BEGIN
	PRINT 'Table gold_products does not exist.';
END

-- Query the table if it exists
SELECT * FROM gold_products;
