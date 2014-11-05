(function ($) {
	"use strict";

	var chatContainer = $('#chat-room');
	var chatContent = $('#chat-content');
	var joinChat = $('#join-chat');

	var user = {};

	var serverEndpoint = "http://localhost:3000";

	var eventSource;

	var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

	$('#join-chat form').submit(function handleJoinChat(e) {

		e.preventDefault();

		var data = $(this).serializeArray();

		$.ajax({
			url: serverEndpoint + '/user',
			type: 'POST',
			data: data,
			success: function (data, textStatus, jqXHR) {
				
				if (data.id) {

					eventSource = new EventSource(serverEndpoint + '/events');
					initSseHandlers();

					user = data;
					loadChat(data);

					alertify.success('Connected to chat server');
				}

				if (data.error) {
					alertify.alert(data.error);
				}
				
			},
			error: function (jqXHR, textStatus, errorThrown) {
				alertify.error('Failed to connect to chat server. Server could be full or not available.');
			}
		});

	});

	function initSseHandlers() {

		eventSource.onmessage = function(e) {
			console.log(e);
		}

		//on join event, update users list
		eventSource.addEventListener('join', function(e) {
			loadUserList();
		}, false);

		//on leave event, update users list
		eventSource.addEventListener('leave', function(e) {
			loadUserList();
		}, false);

		//on chat event, add chat message to chat window
		eventSource.addEventListener('chat', function(e) {
			var data = JSON.parse(e.data);
			var msg = data.message;
			addChatMessage(msg);
		}, false);

		//error handler
		eventSource.onerror = function(e) {
			alertify.error('You were disconnected from the chat server');
			shutDownEventSource();
		}
	}

	$('#enter-chat-message input').keyup(function (e) {
		e.preventDefault();
		var msg = $(this).val();
	    if (e.keyCode == 13) {
	        
	    	if (msg.length > 0) {
	    		var form = $(this).parent();
	    		logChat(form);
	    	}

	    }
	});

	$('#enter-chat-message form').submit(function(e) {
		e.preventDefault();
	});

	$('#leave-chat a').click(function(e) {
		e.preventDefault();
		alertify.confirm("Are you sure you want to leave the chat?", function(c) {
			if (c) {
				leaveChat();
			}
		});
	});

	function loadChat(data) {

		$.ajax({
			url: serverEndpoint + '/chat',
			type: 'GET',
			beforeSend: function(xhr){xhr.setRequestHeader('userId', user.id);},
			success: function (data, textStatus, jqXHR) {
		
				joinChat.slideUp();

				data.chat.forEach(function(messageData, i, array) {
					addChatMessage(messageData);
				});

				chatContainer.slideDown();

				loadUserList();

			},
			error: function (jqXHR, textStatus, errorThrown) {
				alertify.alert(textStatus);
			}
		});

	}

	function addChatMessage(data) {

		var timestamp = new Date(data.timestamp);

		var date = timestamp.getDate();
		date = (date < 10 ? '0' + date : date);

		var month = timestamp.getMonth();
		var year = timestamp.getFullYear();		
		var hour = timestamp.getHours();	
		hour = (hour < 10 ? '0' + hour : hour);

		var mins = timestamp.getMinutes();
		mins = (mins < 10 ? '0' + mins : mins);

		var secs = timestamp.getSeconds();
		secs = (secs < 10 ? '0' + secs : secs);

		timestamp = date + months[month] + year + ' ' + hour + ':' + mins + ':' + secs;

		var html = '';
		html += '<div class="chat">';
		html += '<span class="timestamp">[' + timestamp + ']</span>';
		html += '<span class="username">' + data.username + ':</span>';
		html += '<span class="message">' + data.text + '</span>';
		html += '</div>';

		chatContent.append(html);
	}

	function loadUserList() {

		$.ajax({
			url: serverEndpoint + '/user',
			type: 'GET',
			beforeSend: function(xhr){xhr.setRequestHeader('userId', user.id);},
			success: function (data, textStatus, jqXHR) {
				if (data.users) {
					
					var userList = $("#user-list");

					var html = "<h3>Users</h3>";
					html += "<ul>";

					data.users.forEach(function (v, i, array) {
						html += "<li>" + v.name + "</li>";
					});

					html += "</ul>";

					userList.html(html);

				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				alertify.alert(textStatus);
			}

		});

	}

	function logChat(form) {

		$.ajax({
			url: serverEndpoint + '/chat',
			type: 'POST',
			data: form.serializeArray(),
			beforeSend: function(xhr){xhr.setRequestHeader('userId', user.id);},
			success: function (data, textStatus, jqXHR) {
				if (data.message) {
					form.find('input').val('');
				} else if (data.error) {
					alertify.alert(data.error);
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				alertify.alert(textStatus);
			}
		});

	}

	function leaveChat() {

		$.ajax({
			url: serverEndpoint + '/user',
			type: 'DELETE',
			beforeSend: function(xhr){xhr.setRequestHeader('userId', user.id);},
			success: function (data, textStatus, jqXHR) {
				user = {};
				alertify.success("You have left the chat");
				shutDownEventSource();
			},
			error: function (jqXHR, textStatus, errorThrown) {
				alertify.alert(textStatus);
			}			
		});

	}

	function shutDownEventSource() {
		chatContainer.slideUp();
		chatContent.html('');
		joinChat.slideDown();
		eventSource.close();
		eventSource = null;		
	}

})(jQuery);