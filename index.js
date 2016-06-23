var express = require('express'),
		app   = express(),
    http  = require('http').Server(app),
		path	= require('path'),
		io    = require('socket.io')(http),
		people = {};

// Set Static path
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

// Connect to socket
io.on('connection', function(client) {

	client.on('join', function(name) {
		var sameName = false;
		for (var i in people) {
			if (people[i] === name) {
				sameName = true;
				client.emit("retry", "The name is already exist.");
				break;
			}
		}
		if (!sameName) {
		 people[client.id] = name;
		 io.emit("update", people[client.id] + ' has joined');
		 client.emit("joined", "You have connected to the server");
		 io.emit("update-people", people);
	  }
	});

	client.on("send", function(msg) {
		io.emit("chat", people[client.id], msg);
	});

	client.on("disconnect", function() {
		io.emit("update", people[client.id] + " has left the server.");
		delete people[client.id];
		io.emit("update-people", people);
	});
});




http.listen(3000, function() {
	console.log('listening on *: 3000');
})
