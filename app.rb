require 'sinatra'
require 'json'
require_relative 'database_storage.rb'

configure(:development) do
  require 'pry'
end

before do
  @storage ||= DatabaseStorage.new(logger)

  @types = ['shirt', 'pants', 'sweater']
  @seasons  = ['spring', 'summer', 'fall', 'winter']

  @items = @storage.all_items

  @header_nav_links = [
    {
      href: '/items',
      name: 'Items',
    },
    {
      href: '/combinations?type1=shirt&type2=pants',
      name: 'Combinations',
    },
    {
      href: '/outfits',
      name: 'Outfits',
    },
  ]
end

after do
  @storage.disconnect
end

helpers do
  def active_nav_link_class(link, request_path)
    link_path = link[:href]
    if link_path =~ /\?/
      link_path = link_path.split('?')[0]
    end
    link_path == request_path ? 'active' : ''
  end

  def find_icon_class(tag_name)
    lookup_table = {
      spring: 'fa-duotone fa-flower-tulip',
      summer: 'fa-duotone fa-sun',
      fall: 'fa-sharp fa-solid fa-leaf-maple',
      winter: 'fa-sharp fa-regular fa-snowflake',
      dirty: 'fa-regular fa-washing-machine',
      damaged: 'fa-solid fa-shirt-running',
    }
    lookup_table[tag_name.to_sym]
  end

  def selected_if_equal(rating, value)
    rating == value ? 'selected' : ''
  end

  def dirty_damaged_status(shirt, pants, sweater)
    items = [shirt, pants]
    items << sweater if sweater
    reports = items.reduce([]) do |reports_so_far, item|
      item_type = item[:type]
      problems = []
      problems << 'dirty' if item[:dirty]
      if item[:damaged]
        verb = item_type === 'pants' ? 'need' : 'needs';
        problems << "#{verb} mending"
      end
      if problems.size > 0
        reports_so_far << "#{item_type} #{problems.join(' and ')}"
      end
      reports_so_far
    end
    reports.join(', ')
  end
end

def find_seasons(item)
  @seasons.select { |season| item[season.to_sym] }
end

def season_tags(item)
  tags = []
  seasons = find_seasons(item)
  if seasons.size == 4
    tags << 'All Seasons'
  else
    tags.append(*seasons)
  end
  tags
end

def flaw_tags(item)
  [:dirty, :damaged].select { |prop| item[prop] }
end

get '/' do
  redirect '/items'
end

get '/items' do
  @shirts = @storage.items_by_type('shirt')
  @pants = @storage.items_by_type('pants')
  @sweaters = @storage.items_by_type('sweater')
  @current_page_stylesheet = 'index.css'
  @current_page_scripts = ['index.js']
  erb :items
end

get '/items/:id' do
  @item = @storage.find_item(params[:id].to_i)
  if !@item
    status 404
    'Item not found'
  end
  JSON.dump(@item)
end

post '/items' do
  # {"type"=>"shirt", "image-path"=>"https://images.unsplash.com/photo-1611911813383-67769b37a149?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2960&q=80", "title"=>"d", "spring"=>"on", "summer"=>"on", "fall"=>"on", "winter"=>"on"}
  type = params[:type]
  image_path = params['image-path']
  title = params['title']
  spring = params[:spring] == 'on'
  summer = params[:summer] == 'on'
  fall = params[:fall] == 'on'
  winter = params[:winter] == 'on'
  dirty = params[:dirty] == 'on'
  damaged = params[:damaged] == 'on'

  @storage.create_item(type, image_path, title, spring, summer, fall, winter, dirty, damaged)

  # 'success'
  redirect '/items'
end

post '/items/:id' do
  id = params[:id].to_i
  @item = @storage.find_item(id)

  if !@item
    status 404
    'Item not found'
  end

  image_path = params['image-path']
  title = params['title']
  spring = params['spring'] == 'on'
  summer = params['summer'] == 'on'
  fall = params['fall'] == 'on'
  winter = params['winter'] == 'on'
  dirty = params['dirty'] == 'on'
  damaged = params['damaged'] == 'on'

  @storage.update_item(id, image_path, title, spring, summer, fall, winter, dirty, damaged)

  @updated_item = @storage.find_item(id)

  JSON.dump(@updated_item)
end

post '/items/:id/delete' do
  id = params[:id].to_i
  @storage.delete_item(id)
  redirect '/items'
end

get '/combinations' do
  @current_page_stylesheet = 'combinations.css'
  @current_page_scripts = ['combinations.js']
  @row_type = params[:type2]
  @column_type = params[:type1]
  @row_items = @storage.items_by_type(@row_type)
  @column_items = @storage.items_by_type(@column_type)
  # take ids from column_items, product with row items
  # for each combination, query
  row_ids = @row_items.map { |item| item[:id] }
  column_ids = @column_items.map { |item| item[:id] }

  @stored_combinations = @storage.combinations(column_ids, row_ids)

  @combinations_matrix = row_ids.map do |row_id|
    product_array = [row_id].product(column_ids)
    product_array.map do |row_id, column_id|
      matching_combination = @stored_combinations.find do |combination|
        combination[:column_item_id] == column_id && combination[:row_item_id] == row_id
      end
      if matching_combination && matching_combination[:rating]
        rating = matching_combination[:rating]
      else
        rating = nil
      end
      {
        row_id: row_id,
        column_id: column_id,
        rating: rating,
        row_item: @row_items.find { |el| el[:id] == row_id },
        column_item: @column_items.find { |el| el[:id] == column_id },
      }
    end
  end

  # @combinations_matrix = []
  erb 'combinations/index'.to_sym
end

get '/combination' do
  id1 = params[:id1]
  id2 = params[:id2]
  @item1 = @storage.find_item(id1)
  @item2 = @storage.find_item(id2)
  combination = @storage.find_combination(id1, id2)

  rating = combination ? combination[:rating] : nil

  combination = {
    row_id: id1.to_i,
    column_id: id2.to_i,
    rating: rating,
    row_item: @item1,
    column_item: @item2,
  }
  JSON.dump(combination)

  # get rating from combinations table
  # get item1
  # get item2
end

post '/combinations' do
  params = JSON.parse(request.body.read)
  # {"id1"=>6, "id2"=>18, "rating"=>0}
  id1 = params['id1']
  id2 = params['id2']
  rating = params['rating']

  if @storage.find_combination(id1, id2)
    @storage.update_combination(id1, id2, rating)
  else
    @storage.create_combination(id1, id2, rating)
  end

  JSON.dump({ msg: 'successfully saved combination' })
end

post '/combinations/delete' do
  params = JSON.parse(request.body.read)
  id1 = params['id1']
  id2 = params['id2']
  @storage.delete_combination(id1, id2)
  JSON.dump({msg: 'combination deleted'})
end

post '/combinations/delete_all' do
  @storage.delete_all_combinations
  redirect '/combinations?type1=shirt&type2=sweater'
end

get '/outfits' do
  @show_images = true

  @current_page_stylesheet = 'outfits.css'
  @current_page_scripts = ['outfits.js']
  # @combinations = @storage.combinations

  erb 'outfits/index'.to_sym
end

get '/outfits/query' do
  include_sweaters = params[:includeSweaters] == 'true'

  shirt_pants_combinations = @storage.valid_combinations_by_types('shirt', 'pants')
  outfits = shirt_pants_combinations.map do |combination|
    shirt = @storage.find_item(combination[:id1])
    pants = @storage.find_item(combination[:id2])
    seasons = find_seasons(shirt) & find_seasons(pants)
    {
      shirt: shirt,
      pants: pants,
      shirtPantsRating: combination[:rating],
      overallRating: combination[:rating],
      seasons: seasons,
    }
  end

  outfits = outfits.reject { |outfit| outfit[:seasons].none? }

  if include_sweaters
    sweaters = @storage.items_by_type('sweater')
    shirt_sweater_combos = @storage.valid_combinations_by_types('shirt', 'sweater')
    pants_sweater_combos = @storage.valid_combinations_by_types('pants', 'sweater')

    outfits_including_sweater = []
    outfits_in_progress = outfits

    outfits_in_progress.each do |outfit|
      shirt_id = outfit[:shirt][:id]
      pants_id = outfit[:pants][:id]

      sweaters.each do |sweater|
        shirt_sweater_combo = shirt_sweater_combos.find do |combo|
          combo[:id1] == shirt_id && combo[:id2] == sweater[:id]
        end
        pants_sweater_combo = pants_sweater_combos.find do |combo|
          combo[:id1] == pants_id && combo[:id2] == sweater[:id]
        end
        if shirt_sweater_combo && pants_sweater_combo
          outfit_including_sweater = outfit.merge({
            sweater: sweater,
            shirtSweaterRating: shirt_sweater_combo[:rating],
            pantsSweaterRating: pants_sweater_combo[:rating],
          })
          outfit_including_sweater[:overallRating] *= outfit_including_sweater[:shirtSweaterRating]
          outfit_including_sweater[:overallRating] *= outfit_including_sweater[:pantsSweaterRating]

          outfit_including_sweater[:seasons] = outfit_including_sweater[:seasons] & find_seasons(sweater)

          if outfit_including_sweater[:seasons].none?
            next
          end

          outfits_including_sweater << outfit_including_sweater
        end
      end
    end

    outfits = outfits_including_sweater
  end

  JSON.dump({outfits: outfits})
end


# get '/foo' do
#   JSON.dump({outfits: ['baz', 'quz']})
# end

