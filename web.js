var express = require('express');
var fs = require('fs');
var app = express.createServer(express.logger());
var filename = 'index.html';
var myResp;

var myBuffer = fs.readFileSync(filename);
if (myBuffer) {
  myResp = fs.readFileSync(filename).toString();
} else {
  myResp = 'oops, empty buffer, check ur codez';
}

app.get('/', function(request, response) {
  response.send(myResp);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
