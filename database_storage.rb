require 'pg'

class DatabaseStorage
  def initialize(logger = nil)
    @db = if Sinatra::Base.production?
      PG.connect(ENV['DATABASE_URL'])
    elsif Sinatra::Base.test?
      # PG.connect(dbname: 'matchmaker_test')
    else
      PG.connect(dbname: 'outfits-dev', port: 5433)
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

  def find_item(id)
    sql = <<~SQL
      SELECT * FROM items
      WHERE id = $1
    SQL
    result = query(sql, id)
    tuple_to_item(result[0])
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

  # def query(sql)
  #   @
  # end
end