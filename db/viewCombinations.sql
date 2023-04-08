-- commands to view -- just for practice

-- list combinations
-- SELECT combinations.*,
--   i1.title AS item1_title,
--   i2.title AS item2_title
-- FROM combinations
--   JOIN items AS i1 ON item_id1 = i1.id
--   JOIN items AS i2 ON item_id2 = i2.id;

-- list shirts & pants
SELECT combinations.*,
  i1.title AS shirt_title,
  i2.title AS pants_title
FROM combinations
  JOIN items AS i1 ON item_id1 = i1.id
  JOIN items AS i2 ON item_id2 = i2.id
WHERE i1.type = 'shirt' AND i2.type = 'pants';