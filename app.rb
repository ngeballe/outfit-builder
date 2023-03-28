require 'sinatra'
require 'pry'
require_relative 'database_storage.rb'

before do
  # @storage ||= DatabaseStorage.new(logger)
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
  @current_page_stylesheet = 'index.css'
  @current_page_scripts = ['index.js']
  erb :items
end

get '/combinations' do
  @current_page_stylesheet = 'combinations1.css'
  @current_page_scripts = ['combinations.js']
  erb :combinations
end

get '/outfits' do
  @current_page_stylesheet = 'outfits.css'
  @current_page_scripts = ['outfits.js']
  erb :outfits
end

