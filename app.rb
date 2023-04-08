require 'sinatra'
require 'json'
require_relative 'database_storage.rb'

configure(:development) do
  require 'pry'
end

before do
  @storage ||= DatabaseStorage.new(logger)

  @types = ['shirt', 'pants', 'sweater', 'shoes']
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
end

def items_by_type(items, type)
  items.select { |item| item[:type] == type }
end

def season_tags(item)
  tags = []
  seasons = @seasons.select { |season| item[season.to_sym] }
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
  @shirts = items_by_type(@items, 'shirt')
  @pants = items_by_type(@items, 'pants')
  # binding.pry
  @current_page_stylesheet = 'index.css'
  @current_page_scripts = ['index.js']
  erb :items
end

# get '/items/:id' do
#   @item = @storage.find_item(params[:id].to_i)
#   if !@item
#     status 404
#     'Item not found'
#   end
#   JSON.dump(@item)
# end

get '/combinations' do
  @current_page_stylesheet = 'combinations.css'
  @current_page_scripts = ['combinations.js']
  erb :combinations
end

get '/outfits' do
  @current_page_stylesheet = 'outfits.css'
  @current_page_scripts = ['outfits.js']
  erb :outfits
end

