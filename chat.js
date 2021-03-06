var _ = require("lodash");
var EventEmitter = require("node-event-emitter").EventEmitter;

module.exports = exports = new EventEmitter;

var EVENT_HANDLERS = {
	join: join,
	leave: leave,
	chat: chat
}

var MAX_USERS = 16;
exports.setMaxListeners(16);
var eventId = 1;

var chat = {
	users: [
    { 
      id: 0,
      name: 'System',
      inChat: true
    }
  ],
	chat: []
}

var SYSTEM_USER_ID = 0;

exports.join = join;
exports.leave = leave;
exports.newMessage = newMessage;
exports.chat = chat;
exports.activeUsers = getActiveUsers;
exports.nameExists = checkNameExists;

exports.getUser = function(id) {
  return chat.users.get(id);
}

function getActiveUsers() {
  var allUsers = chat.users;
  return allUsers.filter(function (o) { return o.inChat === true && o.id != 0; });
}

function checkNameExists(name) {
  var activeUsers = getActiveUsers();
  var usersWithName = activeUsers.filter(function (o) { return o.name === name; });
  return (usersWithName.length > 0);
}

function handleEvent(event) {
  var handler = EVENT_HANDLERS[event.name];
  if(!handler) {
    throw new Error("missing handler " + event.name);
  }
  return handler(event);
}

function join(data, callback) {

  var numUsers = chat.users.length;

  if (numUsers <= MAX_USERS) {
  	var user = {
      id: _.uniqueId(),
      name: data.name,
      inChat: true
    }

    chat.users[user.id] = user;

    var message = addMessage('User ' + data.name + ' joined the chat');

  	callback(null, user);

  	emit(event("join", {user: user}));
  } else {
    callback(new Error('Chat room full'), null);
  }
}

function leave(data, callback) {
  if (chat.users[data.userid]) {

    var user = chat.users[data.userid];
    chat.users[data.userid].inChat = false;

    var message = addMessage('User ' + user.name + ' left the chat');

    callback(null, user);

    emit(event("leave", {user: user}));

  } else {
    callback(new Error('User does not exist'), false);
  }  
}

function newMessage(data, callback) {

  var message = addMessage(data.message, chat.users[data.userid].name);

  callback(null, message);
}

function state() {
  return {
    chat: {
      users: chat.users.members,
      chat: chat.chat
    },
    eventId: eventId,
  }
}

function event(name, data) {
  return _.extend(data, {id: eventId++, name:name});
}

function emit(event) {
  exports.emit("chatEvent", event);
}

function addMessage(msg, username) {

  username = username || chat.users[SYSTEM_USER_ID].name;

  var message = {
    id: _.uniqueId("chatMessage"),
    text: msg,
    username: username,
    timestamp: new Date()
  };

  if (chat.chat.push(message)) {
    emit(event("chat", {message: message}));
    return message;
  } else {
    return false;
  }
}
