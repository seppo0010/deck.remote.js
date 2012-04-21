/*!
Deck JS - deck.goto - v1.0
Copyright (c) 2011 Caleb Troughton
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module adds the necessary methods and key bindings to show and hide a form
for jumping to any slide number in the deck (and processes that form
accordingly). The form-showing state is indicated by the presence of a class on
the deck container.
*/
(function($, deck, undefined) {
	var $d = $(document);
	
	/*
	jQuery.deck('remoteInit')
	
	Starts listening for remotes.
	*/

	var remoteServer = {
		currentSlide: 0,
		socket: null,
		ip: '127.0.0.1',
		port: '8080',
		init: function() {
			this.socket = io.connect(this.ip + ":" + this.port);

			if (location.href.indexOf('#mirror') != -1) {
				this.initMirror(parseInt(location.href.substr(7+location.href.indexOf('#mirror'))));
				return;
			}
			var $this = this;
			this.socket.on('connect', function(evt) {
				$this.socket.emit("identify", {"name":"server", "url":location.href});
				$this.sendStatus();
			});
			this.socket.on('command', function(data) {
				if (data == 'next') { $.deck('next'); }
				if (data == 'prev') { $.deck('prev'); }
			});
		},
		initMirror: function(offset) {
			$this = this;
			this.socket.on('connect', function(evt) {
				$this.socket.emit("identify", "servermirror");
			});
			this.socket.on('slideStatus', function(data) {
				$[deck]('go', data.currentSlide + offset);
			});
			this.sendStatus = function() {};
		},
		sendStatus: function() {
			var notes = $('.hidden-notes', $[deck]('getSlide', this.currentSlide)).text();
			this.socket.emit("identify", {"name":"server", "url":location.href});
			this.socket.emit("slideStatus", { "currentSlide": this.currentSlide, "notes":  notes });
		}
	};
	$[deck]('extend', 'remoteInit', function() {
		try {
			remoteServer.init();
		} catch (e) {
		}
	});

	$d.bind('deck.change', function(e, from, to) {
		remoteServer.currentSlide = to;
		remoteServer.sendStatus();
	});
	jQuery.deck('remoteInit');
})(jQuery, 'deck');

