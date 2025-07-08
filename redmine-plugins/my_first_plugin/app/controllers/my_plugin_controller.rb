# class MyPluginController < ApplicationController
#   def index
#     @message = "Hello from My First Redmine Plugin!"
#     @current_time = Time.now
#   end
# end

class MyPluginController < ApplicationController
  
  def index
    @message = "Hello from My First Redmine Plugin!"
    @current_time = Time.now
    
    # Replace this with your actual Ozwell login URL
    @ozwell_login_url = "https://ai.bluehive.com/session/5fKZwA4LKZ6m6Z8Hx?token=z73ky09q6WlgreH5MLH-bTeBr9AJfbd9Xw-uwoBl9mv&embedType=iframe-basic"
    
    if User.current.logged?
      @current_user = User.current
    else
      flash[:error] = "Please log in to use Ozwell integration"
    end
  end
end