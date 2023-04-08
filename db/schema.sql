CREATE TABLE items(
  id serial PRIMARY KEY,
  type text NOT NULL,
  image_path text NOT NULL,
  title text,
  spring boolean NOT NULL DEFAULT true,
  summer boolean NOT NULL DEFAULT true,
  fall boolean NOT NULL DEFAULT true,
  winter boolean NOT NULL DEFAULT true,
  dirty boolean NOT NULL DEFAULT false,
  damaged boolean NOT NULL DEFAULT false
);

CREATE TABLE combinations(
  id serial PRIMARY KEY,
  item_id1 integer REFERENCES items(id) ON DELETE CASCADE,
  item_id2 integer REFERENCES items(id) ON DELETE CASCADE,
  rating integer
);
