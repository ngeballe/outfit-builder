DELETE FROM items;
DELETE FROM combinations;

INSERT INTO items(type, image_path, title) VALUES
  ('pants', 'images/pants/brown cords.jpg', 'brown cords'),
  ('pants', 'images/pants/light khakis.jpg', 'light khakis'),
  ('pants', 'images/pants/gray pants.jpg', 'gray pants'),
  ('pants', 'images/pants/suit pants with little blue dots.jpg', 'suit pants with little blue dots'),
  ('shirt', 'images/shirts/McCaulous Hawaiian.jpg', 'McCaulous Hawaiian'),
  ('shirt', 'images/shirts/Space Needle T-shirt.jpg', 'Space Needle T-shirt'),
  ('shirt', 'images/shirts/black & white Hawaiian.jpg', 'black & white Hawaiian'),
  ('shirt', 'images/shirts/black with blue dots button-up.jpg', 'black with blue dots button-up'),
  ('shirt', 'images/shirts/blue-green-white checked button-up shirt.jpg', 'blue-green-white checked button-up shirt'),
  ('shirt', 'images/shirts/brick red with gray lines plaid shirt.jpg', 'brick red with gray lines'),
  ('shirt', 'images/shirts/burgundy.jpg', 'burgundy'),
  ('shirt', 'images/shirts/dark blue thin stripes button-up.jpg', 'dark blue thin stripes button-up'),
  ('shirt', 'images/shirts/golden columns.jpg', 'golden columns'),
  ('shirt', 'images/shirts/inky dark blue short-sleeved button-up.jpg', 'inky dark blue short-sleeved button-up'),
  ('shirt', 'images/shirts/light blue long-sleeved T-shirt.jpg', 'light blue long-sleeved T-shirt'),
  ('shirt', 'images/shirts/short-sleeved black button-up.jpg', 'short-sleeved black button-up'),
  ('sweater', 'images/sweaters/blue & brown plaid overshirt.jpg', 'blue & brown plaid overshirt'),
  ('sweater', 'images/sweaters/dark red plaid overshirt.jpg', 'dark red plaid overshirt'),
  ('sweater', 'images/sweaters/blue & orange plaid overshirt.jpg', 'blue & orange plaid overshirt'),
  ('sweater', 'images/sweaters/gray-brown plaid overshirt.jpg', 'gray-brown plaid overshirt'),
  ('sweater', 'images/sweaters/blue plaid overshirt.jpg', 'blue plaid overshirt'),
  ('sweater', 'images/sweaters/red v-neck zipper.jpg', 'red v-neck zipper');

INSERT INTO combinations(item_id1, item_id2) VALUES
  (6, 2),
  (6, 3),
  (6, 4),
  (6, 5);
