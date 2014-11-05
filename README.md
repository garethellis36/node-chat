node-chat
=========

Basic NodeJS chat server.

usage
=====

NodeJS and NPM are required.

npm install  
node server.js

endpoints
=========

POST /user
Join chat room. Expects POST data 'name'. Must be unique from other names already on server. Returns object with user including userId.

GET /user
Get list of users. User ID of current user must be sent as header 'userId'.

GET /chat
Get current chat content (to be used on join to populate previous chat messages).

POST /chat
Post new chat message. Expects POST data 'message'. User ID of current user must be sent as header 'userId'.

DELETE /user
Leave chat. User ID of current user must be sent as header 'userId'.

GET /events
Event listening endpoint. See below section on Server-Sent Events.


Server-Sent Events
==================

The following SSEs are sent and can be listened to by the client:

'join' - on new user joining  
'leave' - on user leaving  
'chat' - on posting of new message