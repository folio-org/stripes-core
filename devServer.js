var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.cli.dev');

let stripesModules;
try {
  stripesModules = require('./stripes-modules');
} catch (err) {
  if (err.message.match(/Cannot find module/)) {
    console.log("can't find additional stripes-modules; skipping");
  } else {
    throw err;
  }
}

if (stripesModules) {
  console.log("additional stripes: modules = " + JSON.stringify(stripesModules));
  Object.assign(config.stripesLoader.modules, stripesModules);
}

var app = express();
var compiler = webpack(config);

app.use(express.static(__dirname + '/public'));

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3000');
});
