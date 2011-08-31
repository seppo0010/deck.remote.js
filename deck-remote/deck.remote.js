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
		myWebSocket: null,
		ip: '127.0.0.1',
		port: '8080',
		init: function() {
			if ('WebSocket' in window == false && 'MozWebSocket' in window) window.WebSocket = window.MozWebSocket;

			this.myWebSocket = new WebSocket("ws://" + this.ip + ":" + this.port);

			if (location.href.indexOf('#mirror') != -1) {
				this.initMirror(parseInt(location.href.substr(7+location.href.indexOf('#mirror'))));
				return;
			}
			$this = this;
			this.myWebSocket.onopen = function(evt) {
				$this.myWebSocket.send('{"type":"identify", "data":"server", "url":"' + location.href + '"}');
			};
			this.myWebSocket.onmessage = function(evt) {
				try {
					var data = jQuery.parseJSON(evt.data);
					if (data.type == 'command') {
						if (data.data == 'next') { $.deck('next'); }
						if (data.data == 'prev') { $.deck('prev'); }
					}
				} catch (e) {
				}
			};
			this.myWebSocket.onclose = function(evt) {};
		},
		initMirror: function(offset) {
			$this = this;
			this.myWebSocket.onopen = function(evt) {
				$this.myWebSocket.send('{"type":"identify", "data":"servermirror"}');
			};
			this.myWebSocket.onmessage = function(evt) {
				try {
					var data = jQuery.parseJSON(evt.data);
					if (data.type == 'status') {
						$[deck]('go', data.data.currentSlide + offset);
					}
				} catch (e) {
				}
			};
			this.myWebSocket.onclose = function(evt) {};
			this.sendStatus = function() {};
		},
		sendStatus: function() {
			this.myWebSocket.send('{"type":"status", "data": { "currentSlide": ' + this.currentSlide + ' } }');
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

