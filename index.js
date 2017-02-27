var express = require('express');
var path = require('path');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.use('/js', express.static(path.join(__dirname, 'js')))

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
