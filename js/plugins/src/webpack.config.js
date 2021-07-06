const path = require('path');


module.exports = {
  entry: {
	  SRW_Menus: './js/SRW Menus/main.js',
	  SRW_BattleScene: './js/Battle Scene/main.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/..'
  },
  mode: 'development',
  node: {
	fs: 'empty'
},
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  
};