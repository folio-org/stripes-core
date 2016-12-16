var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.cli.dev');

var app = express();
var compiler = webpack(config);

var port = process.env.STRIPES_PORT || 3000;
var host = process.env.STRIPES_IFACE || 'localhost';

app.use(express.static(__dirname + '/public'));

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, host, function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://' + host + ':' + port);
});
