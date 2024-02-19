fx_version 'cerulean'
game 'gta5'
lua54 'yes'
description 'BM-BloodSample'
version '0.001'
repository 'https://github.com/BobWritesCode/bm-bloodsample'

shared_scripts {
    'config.lua'
}

client_scripts {
  '@PolyZone/client.lua',
  '@PolyZone/BoxZone.lua',
  '@PolyZone/EntityZone.lua',
  '@PolyZone/CircleZone.lua',
  '@PolyZone/ComboZone.lua',
  'client/main.lua'
}

server_script {
  '@oxmysql/lib/MySQL.lua',
  'server/main.lua'
}

ui_page 'html/index.html'

files {
  'html/jquery-3.7.1.min.js',
	'html/index.html',
	'html/script.js',
	'html/style.css',
}
