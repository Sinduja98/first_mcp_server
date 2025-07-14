# class MyPluginController < ApplicationController
#   def index
#     @message = "Hello from My First Redmine Plugin!"
#     @current_time = Time.now
#   end
# end

# class MyPluginController < ApplicationController
  
#   def index
#     @message = "Hello from My First Redmine Plugin!"
#     @current_time = Time.now
    
#     # Replace this with your actual Ozwell login URL
#     @ozwell_login_url = "https://ai.bluehive.com/session/a7Cg2Ts9ZZm5Jq5zb?token=wlJwXrH_bTG1KE_uvGVhriyCvvVUUVKNvej20Il1Oay&embedType=iframe-basic"
    
#     if User.current.logged?
#       @current_user = User.current
#     else
#       flash[:error] = "Please log in to use Ozwell integration"
#     end
#   end
# end

# require 'net/http'
# require 'uri'
# require 'json'

# class MyPluginController < ApplicationController
#   def index
#     @message = "Hello from My First Redmine Plugin!"
#     @current_time = Time.now

#     if User.current.logged?
#       @current_user = User.current

#       api_key = ENV['OZWELL_API_KEY']
#       workspace_id = ENV['OZWELL_WORKSPACE_ID']
#       user_id = ENV['OZWELL_USER_ID']

#       uri = URI("https://ai.bluehive.com/api/v1/workspaces/#{workspace_id}/create-user-session")
#       http = Net::HTTP.new(uri.host, uri.port)
#       http.use_ssl = true

#       request = Net::HTTP::Post.new(uri.path, {
#         'Authorization' => "Bearer #{api_key}",
#         'Content-Type' => 'application/json'
#       })

#       request.body = {
#         userId: user_id,
#         metaData: {
#           createListenSession: true,
#           forceNewSession: true,
#           embedType: "iframe-basic"
#         }
#       }.to_json
#       puts "🔍 USER LOGGED IN: #{@current_user.name}"
#       puts "🔐 API KEY: #{api_key}"
#       puts "📡 Sending request to: #{uri}"
#       puts "📦 Request body: #{request.body}"
#       response = http.request(request)
#       puts "Ozwell API response: #{response.body}"
#       puts "📥 Response code: #{response.code}"
  

#       if response.code.to_i == 200
#         puts "inside if condition#############"
#         json_response = JSON.parse(response.body)
#         @ozwell_login_url = json_response['loginUrl']
#         puts "Ozwell session url: #{}"
#       else
#         flash[:error] = "Ozwell session creation failed: #{response.body}"
#       end
#     else
#       flash[:error] = "Please log in to use Ozwell integration"
#     end
#   end
# end

require 'net/http'
require 'uri'
require 'json'

class MyPluginController < ApplicationController
  def index
    @message = "Hello from My First Redmine Plugin!"
    @current_time = Time.now

    if User.current.logged?
      @current_user = User.current

      # Read environment variables from .env file
      api_key = ENV['OZWELL_API_KEY']
      workspace_id = ENV['OZWELL_WORKSPACE_ID']
      user_id = ENV['OZWELL_USER_ID']

      # === DEBUG: Environment Variables Test ===
      puts "=== ENVIRONMENT VARIABLES DEBUG ==="
      puts "API_KEY: #{api_key ? 'LOADED' : 'MISSING'} (Length: #{api_key&.length})"
      puts "WORKSPACE_ID: #{workspace_id ? 'LOADED' : 'MISSING'} (Value: #{workspace_id})"
      puts "USER_ID: #{user_id ? 'LOADED' : 'MISSING'} (Value: #{user_id})"
      puts "Raw API_KEY (first 20 chars): #{api_key&.first(20)}..."
      puts "=================================="

      # Store for view display
      @debug_info = {
        api_key_present: !api_key.nil? && !api_key.empty?,
        api_key_length: api_key&.length,
        workspace_id: workspace_id,
        user_id: user_id,
        api_key_preview: api_key&.first(20)
      }

      # Check if environment variables are loaded
      unless api_key && workspace_id && user_id
        flash[:error] = "Ozwell configuration missing. Please check environment variables."
        puts "❌ Missing environment variables!"
        return
      end

      # Try the correct API endpoint based on Ozwell documentation
      # The issue might be with the endpoint URL
      uri = URI("https://ai.bluehive.com/api/v1/workspaces/#{workspace_id}/create-user-session")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true

      request = Net::HTTP::Post.new(uri.path, {
        'Authorization' => "Bearer #{api_key}",
        'Content-Type' => 'application/json'
      })

      request.body = {
        userId: user_id,
        metaData: {
          createListenSession: true,
          forceNewSession: true,
          embedType: "iframe-basic"
        }
      }.to_json

      puts "🔍 USER LOGGED IN: #{@current_user.name}"
      puts "🔐 API KEY: #{api_key&.first(15)}..." 
      puts "📡 Sending request to: #{uri}"
      puts "📦 Request body: #{request.body}"

      begin
        response = http.request(request)
        puts "📥 Response code: #{response.code}"
        puts "📥 Response body: #{response.body}"

        case response.code.to_i
        when 200
          puts "✅ Ozwell API call successful"
          json_response = JSON.parse(response.body)
          @ozwell_login_url = json_response['loginUrl']
          puts "🔗 Ozwell session url: #{@ozwell_login_url}"
        when 405
          puts "❌ Method Not Allowed (405) - This endpoint doesn't accept POST requests"
          flash[:error] = "API endpoint configuration issue. Contact Ozwell support to verify the correct endpoint."
        when 401
          puts "❌ Unauthorized (401) - Check your API key"
          flash[:error] = "Invalid API key. Please check your Ozwell credentials."
        when 404
          puts "❌ Not Found (404) - Wrong endpoint URL"
          flash[:error] = "API endpoint not found. Please verify the correct Ozwell API URL."
        else
          puts "❌ Ozwell API call failed with code: #{response.code}"
          flash[:error] = "Ozwell session creation failed: #{response.body}"
        end
      rescue => e
        flash[:error] = "Error connecting to Ozwell: #{e.message}"
        puts "❌ Exception occurred: #{e.message}"
      end
    else
      flash[:error] = "Please log in to use Ozwell integration"
    end
  end
end