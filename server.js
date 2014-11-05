var _ = require("lodash");
var chat = require("./chat.js");
var sse = require("./sse.js");
var express = require("express");

var app = express();

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: true
})); 
app.use(require("express-session")({
  secret: process.env.SESSION_SECRET || "not safe",
  resave: true,
  saveUninitialized: true,
}));

//handle user joining chat
app.post("/user", function (req, res) {
	
	if (!req.body.name) {
		return res.status(200).send({error:'Name must be provided'}).end();
	} else {
		if (chat.nameExists(req.body.name)) {
			return res.status(200).send({error: 'Name already exists - pick another one'}).end();
		}
	}

	chat.join({
		name: req.body.name
	},
	function (err, user) {
		if (err) {
			return res.status(500).send({error:'Failed to connect'}).end();
		}
		req.session.userId = user.id;
		return res.status(200).send(user);
	});	

});


//get list of users
app.get("/user", function (req, res) {
	var userId = req.get('userId');
	if (!userId) {
		return res.status(401).send({error: 'not authorized'});
	} 
	var users = {
		users: chat.activeUsers()
	};
	res.status(200).send(users);
});

//user leaves chat room
app.delete("/user", function (req, res) {
	var userId = req.get('userId');
	if (!userId) {
		return res.status(401).send({error: 'not authorized'});
	} else {
		chat.leave({
			userid: userId
		},
		function (err, user) {
			if (err) {
				console.log(err);
				return res.status(500).send({error:'Failed to leave chat'}).end();
			}
			return res.status(200).send(user);
		});
	}
});

//populate chat room with previous chat
app.get("/chat", function (req, res) {
	var userId = req.get('userId');
	if (userId) {
		res.status(200).send(chat.chat);
	} else {
		res.status(401).send({error: 'not authorized'});
	}
});

//handle new chat posting
app.post("/chat", function (req, res) {
	var userId = req.get('userId');
	if (!userId) {
		return res.status(401).send({error: 'not authorized'});
	} else if (!req.body.message) {
		return res.status(400).send({error: 'please enter a message'});
	} else {
		chat.newMessage({
			userid: userId,
			message: req.body.message
		},
		function (err, msg) {
			if (err) {
				console.log(err);
				return res.status(500).send({error:'Failed to add message'}).end();
			}
			return res.status(200).send({message: msg});
		});
	}
});


app.get("/events", function(req, res) {

  sse.start(res);

  sse(res, "connected", {});
  chat.addListener("chatEvent", handleEvent);

  res.on("end", function() {
    chat.removeListener("chatEvent", handleEvent);
  });

  function handleEvent(event) {
    console.log("sending '%s'", event.name);
    sse(res, "chatEvent", event);
  }
});


if (require.main === module) {
  app.listen(3000, function() {
    console.log("Chat room listening...");
  })

} else {
  module.exports = app;
}