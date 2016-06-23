$(document).ready(function() {
	var socket = io();
	var ready = false;
	var name;

	$("#chat").hide();
	$('#people').parent('div').hide();
	$('#info').hide();
	$("#name").focus();
	$("form").submit(function(e) {
		e.preventDefault();
	});

	$("#login").submit(function() {
		name = $("#name").val();

		if (name != "") {
			$('#info').hide();
			socket.emit("join", name);
		} else {
			$('#content').text('Please, write your name');
		}
	});

	$('#chat').on('click', '#reconnect', function(e) {
		socket.connect();
		socket.emit("join", name);
		$('#people').show();
		$('#reconnect').hide();
		$('#reconnect').attr('disabled','disabled');
		$('#send').removeAttr('disabled');
		$('#send').show();
		$('#msg').removeAttr('disabled').focus();
	})

	$('#chat').submit(function(e) {
		var msg = $('#msg').val()
		if (msg != '') {
			$('#info').hide();
			socket.emit("send", msg);
			$('#msg').val('');
		} else {
			$('#content').text('Please write the message');
			$('#info').show();
		}
	});

	$('#people').on('click', '.glyphicon', function(e) {
		socket.disconnect();
		$('#messages').append($('<li>').text("You've been successfully logged out").addClass('.info'));
		$('#send').hide();
		$('#send').attr('disabled', 'disabled');
		$('#reconnect').show();
		$('#msg').attr('disabled', 'disabled');
		$('#people').hide();
		ready = false;
	});


  socket.on("joined", function(msg) {
		$("#login").hide();
		$("#chat").show();
		$("#msg").focus();

		$("#messages").append($('<li>').text(datedMsg(msg)).addClass('info'));
		$('#people').parent('div').show();
		ready = true;
	});

	socket.on("update", function(msg) {

		if(ready) {
			$("#messages").append("<li class='info'>"+datedMsg(msg)+"</li>");
		}
	});

	socket.on("update-people", function(people) {
		if (ready) {
			$("#people").empty();
			$.each(people, function(clientid, clientName) {
				if (clientName == name) {
					var span1 = $('<span>').text(clientName).addClass('name');
					var span2 = $('<span>').addClass('glyphicon glyphicon-log-out');
					$('#people').append($('<li>').append(span1).append(span2));
				} else {
					$('#people').append($("<li>").text(clientName));
				}
			})
		}
	});

	socket.on('retry', function(msg) {
		$('#content').text(msg);
		$('#info').show();
		$('#name').val('');
		$('#name').focuse();
	})

	socket.on('chat', function(who, msg) {
		if(ready) {
			$('#messages').append('<li><strong>'+ who +'</strong> says: ' + msg + '</li>');
		}
	});

})

function datedMsg(msg) {
	var d = new Date();
	var text = msg + ' at ' + d.toUTCString().slice(5, -4);
	return text;
}
