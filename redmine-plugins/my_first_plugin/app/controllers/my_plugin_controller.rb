class MyPluginController < ApplicationController
  def index
    @message = "Hello from My First Redmine Plugin!"
    @current_time = Time.now
  end
end