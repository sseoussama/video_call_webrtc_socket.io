
var os = require('os');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var express = require('express')



app.use(express.static('public'));
app.get('/',function(req,res){
	
	res.sendFile(__dirname + '/index.html');
});


var PORT = process.env.PORT || 8080;
http.listen(PORT,function(){
	console.log('The server is running on %s',PORT);
});

require('./socket.js')(io);