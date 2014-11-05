(function ($) {
	"use strict";

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
				}

				if (data.error) {
					alertify.alert(data.error);
				}
				
			},
			error: function (jqXHR, textStatus, errorThrown) {
				// TODO handle error
			}
		});

	});

	function initSseHandlers() {

		eventSource.onmessage = function(e) {
			console.log(e);
		};

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
		
				$('#join-chat').slideUp();

				var chatContainer = $('#chat-room');
				var chatContent = $('#chat-content');

				var html = '';
				data.chat.forEach(function(v, i, array) {

					var timestamp = new Date(v.timestamp);

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

					html += '<div class="chat">';
					html += '<span class="timestamp">[' + timestamp + ']</span>';
					html += '<span class="username">' + data.users[v.userid].name + ':</span>';
					html += '<span class="message">' + v.text + '</span>';
					html += '</div>';
				});
				chatContent.html(html);

				chatContainer.slideDown();

				loadUserList();

			},
			error: function (jqXHR, textStatus, errorThrown) {
				alertify.alert(textStatus);
			}
		});

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
				$('#chat-room').slideUp();
				$('#join-chat').slideDown();
				eventSource.close();
				eventSource = null;
			},
			error: function (jqXHR, textStatus, errorThrown) {
				alertify.alert(textStatus);
			}			
		});

	}

})(jQuery);