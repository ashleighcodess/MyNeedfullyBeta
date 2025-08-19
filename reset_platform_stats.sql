
-- Reset platform_stats table to show zero values on Community Impact page
-- This will make the page display "0 Products", "0 Lists", and "0 Smiles" consistently

UPDATE platform_stats 
SET 
    totalSupport = 0,
    itemsFulfilled = 0,
    familiesHelped = 0,
    donationValue = 0,
    needsListCreated = 0,
    needsListFulfilled = 0,
    smilesSpread = 0,
    productsDelivered = 0,
    updatedAt = CURRENT_TIMESTAMP,
    notes = 'Statistics reset to zero for consistent display'
WHERE id = 1;

-- If no record exists, insert a new one with zero values
INSERT INTO platform_stats (
    id,
    totalSupport,
    itemsFulfilled,
    familiesHelped,
    donationValue,
    needsListCreated,
    needsListFulfilled,
    smilesSpread,
    productsDelivered,
    updatedBy,
    notes,
    createdAt,
    updatedAt
) 
SELECT 
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    'system',
    'Initial zero values for consistent display',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM platform_stats WHERE id = 1);
