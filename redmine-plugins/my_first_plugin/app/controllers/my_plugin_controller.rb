class MyPluginController < ApplicationController
  def index
    render plain: "Hello from My First Redmine Plugin!"
  end
end
