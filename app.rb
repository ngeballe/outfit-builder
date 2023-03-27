require 'sinatra'
require 'pry'

before do
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

helpers do
  def active_nav_link_class(link, request_path)
    link_path = link[:href]
    if link_path =~ /\?/
      link_path = link_path.split('?')[0]
    end
    link_path == request_path ? 'active' : ''
  end
end

get '/' do
  redirect '/items'
end

get '/items' do
  # binding.pry
  # @active_he = '/items'
  @current_page_stylesheet = 'index.css'
  @current_page_scripts = ['index.js']
  erb :items
end

get '/combinations' do
  # binding.pry
  @current_page_stylesheet = 'combinations.css'
  @current_page_scripts = ['combinations.js']
  erb :combinations
end

get '/outfits' do
  @current_page_stylesheet = 'outfits.css'
  @current_page_scripts = ['outfits.js']
  erb :outfits
end

