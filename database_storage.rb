require 'pg'

class DatabaseStorage
  def initialize(logger = nil)
    @db = if Sinatra::Base.production?
      PG.connect(ENV['DATABASE_URL'])
    elsif Sinatra::Base.test?
      # PG.connect(dbname: 'matchmaker_test')
    else
      # PG.connect(dbname: 'outfits-dev', port: 5433)
      PG.connect(dbname: 'outfits-dev')
    end
    @logger = logger if logger
  end

  def query(statement, *params)
    @logger.info "#{statement}: #{params}" if @logger
    @db.exec_params(statement, params)
  end

  def disconnect
    @db.close
  end

  def all_items
    sql = "SELECT * FROM items ORDER BY id"
    result = query(sql)
    result.map do |tuple|
      tuple_to_item(tuple)
    end
  end

  def items_by_type(type)
    sql = <<~SQL
      SELECT * FROM items
      WHERE type = $1
      ORDER BY id
    SQL
    result = query(sql, type)
    result.map do |tuple|
      tuple_to_item(tuple)
    end
  end

  def find_item(id)
    sql = <<~SQL
      SELECT * FROM items
      WHERE id = $1
    SQL
    result = query(sql, id)
    tuple_to_item(result[0])
  end

  def create_item(type, image_path, title, spring, summer, fall, winter, dirty, damaged)
    sql = <<~SQL
      INSERT INTO items(type, image_path, title, spring, summer, fall, winter, dirty, damaged)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
    SQL
    query(sql, type, image_path, title, spring, summer, fall, winter, dirty, damaged)
  end

  def update_item(id, image_path, title, spring, summer, fall, winter, dirty, damaged)
    sql = <<~SQL
      UPDATE items
      SET image_path = $2, title = $3, spring = $4,
        summer = $5, fall = $6, winter = $7, dirty = $8,
        damaged = $9
      WHERE id = $1;
    SQL
    query(sql, id, image_path, title, spring, summer, fall, winter, dirty, damaged)
  end

  def delete_item(id)
    sql = "DELETE FROM items WHERE id = $1"
    query(sql, id)
  end

  def combinations(column_ids, row_ids)
    column_ids_string = column_ids.join(', ')
    row_ids_string = row_ids.join(', ')

    sql = <<~SQL
      SELECT * from combinations
      WHERE item_id1 IN (#{column_ids_string})
      AND item_id2 IN (#{row_ids_string})
    SQL
    result = query(sql)
    result.map do |tuple|
      tuple_to_combination(tuple)
    end
  end

  def combinations_by_types(type1, type2)
    sql = <<~SQL
      WHERE item_id1 IN (SELECT id FROM items WHERE type = 'shirt') AND item_id2 IN (SELECT id FROM items WHERE type = 'pants');
    SQL
  end

  def valid_combinations_by_types(type1, type2)
    sql = <<~SQL
      SELECT
        item_id1,
        rating,
        items1.type AS item1_type,
        items1.title AS item1_title,
        item_id2,
        items2.type AS item2_type,
        items2.title AS item2_title
      FROM combinations
      JOIN items AS items1 ON item_id1 = items1.id
      JOIN items AS items2 ON item_id2 = items2.id
      WHERE rating > 0
        AND items1.type = $1
        AND items2.type = $2
    SQL
    result = query(sql, type1, type2)
    result.map do |tuple|
      tuple_to_full_combination(tuple)
    end
  end

  def find_combination(id1, id2)
    sql = <<~SQL
      SELECT * from combinations
      WHERE item_id1 = $1
        AND item_id2 = $2
    SQL
    result = query(sql, id1, id2)

    return nil unless result.first
    tuple_to_combination(result.first)
  end

  def create_combination(id1, id2, rating)
    sql = <<~SQL
      INSERT INTO combinations(item_id1, item_id2, rating)
        VALUES($1, $2, $3)
    SQL
    query(sql, id1, id2, rating)
  end

  def update_combination(id1, id2, rating)
    sql = <<~SQL
      UPDATE combinations
        SET rating = $3
        WHERE item_id1 = $1 AND item_id2 = $2
    SQL
    query(sql, id1, id2, rating)
  end

  def delete_all_combinations
    sql = <<~SQL
      DELETE FROM combinations
    SQL
    query(sql)
  end

  private

  def tuple_to_item(tuple)
    {
      id: tuple['id'].to_i,
      type: tuple['type'],
      title: tuple['title'],
      image_path: tuple['image_path'],
      spring: tuple['spring'] == 't',
      summer: tuple['summer'] == 't',
      fall: tuple['fall'] == 't',
      winter: tuple['winter'] == 't',
      dirty: tuple['dirty'] == 't',
      damaged: tuple['damaged'] == 't',
    }
  end

  def tuple_to_combination(tuple)
    {
      id: tuple['id'].to_i,
      column_item_id: tuple['item_id1'].to_i,
      row_item_id: tuple['item_id2'].to_i,
      rating: tuple['rating'] &. to_i,
    }
  end

  def tuple_to_full_combination(tuple)
   #    {"item_id1"=>"11",
   # "rating"=>"5",
   # "item1_type"=>"shirt",
   # "item1_title"=>"brick red with gray lines",
   # "item_id2"=>"2",
   # "item2_type"=>"pants",
   # "item2_title"=>"brown cords"}
    {
      id1: tuple['item_id1'].to_i,
      type1: tuple['item1_type'],
      title1: tuple['item1_title'],
      id2: tuple['item_id2'].to_i,
      type2: tuple['item2_type'],
      title2: tuple['item2_title'],
      rating: tuple['rating'].to_i,
    }
  end
end