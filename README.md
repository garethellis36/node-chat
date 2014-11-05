node-chat
=========

Basic NodeJS chat server.

usage
=====

npm install  
node server.js

endpoints
=========

POST /user
Join chat room. Expects POST data 'name'. Must be unique from other names already on server. Returns object with user including userId.

GET /user
Get list of users. User ID of current user must be sent as header 'userId'.

POST /chat
Post new chat message. Expects POST data 'message'. User ID of current user must be sent as header 'userId'.

DELETE /user
Leave chat. User ID of current user must be sent as header 'userId'.


client
======

An example client is provided in example-client/. To use:

bower install  
grunt

Then open index.html in browser (web server not required).