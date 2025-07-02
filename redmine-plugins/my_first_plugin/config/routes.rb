RedmineApp::Application.routes.draw do
  get 'my_plugin', :to => 'my_plugin#index'
end
