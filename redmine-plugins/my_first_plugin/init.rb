

Redmine::Plugin.register :my_first_plugin do
  name 'My first redmine Plugin'
  author 'Kuna'
  description 'My first Redmine plugin through mounting plugin'
  version '1.0.0'
  url 'https://github.com/Sinduja98/first_mcp_server'
  author_url 'https://github.com/Sinduja98'

    menu :application_menu, :my_plugin, {
    controller: 'my_plugin', 
    action: 'index'
  }, caption: 'My Plugin', after: :projects

end




