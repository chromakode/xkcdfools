function pathFilename(path) {
	match = /\/([^\/]+)$/.exec(path);
	if (match) {
		return match[1];
	}
}

function getRandomInt(min, max) {
	// via https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Math/random#Examples
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(items) {
	return items[getRandomInt(0, items.length-1)];
}

var xkcd = {
	latest: null,
	last: null,
	cache: {},
	
	get: function(num, success, error) {
		if (num == null) {
			path = '/proxy.php?mode=native&url=http://xkcd.com/info.0.json';
		} else if (Number(num)) {
			path = '/proxy.php?mode=native&url=http://xkcd.com/'+num+'/info.0.json';
		} else {
			error(false);
			return false;
		}
		
		if (num in this.cache) {
			this.last = this.cache[num];
			success(this.cache[num]);
		} else {
			return $.ajax({
				url: window.location+path,
				dataType: 'json',
				success: $.proxy(function(data) {
					this.last = this.cache[num] = data;
					success(data);
				}, this),
				error: error});
		}
	}
};


/*TerminalShell.commands['ls'] = function(terminal, path) {
	if (path) {
		
	} else {
		
	}
};*/

var xkcdDisplay = TerminalShell.commands['display'] = function(terminal, path) {
	function fail() {
		terminal.print($('<p>').addClass('error').text('display: unable to open image "'+path+'": No such file or directory.'));
		terminal.setWorking(false);
	}
		
	terminal.setWorking(true);
	
	if (path) {
		path = String(path);
		num = Number(path.match(/^\d+/));
		filename = pathFilename(path);
	} else {
		num = xkcd.last.num;
	}
	xkcd.get(num, function(data) {
		if (!filename || (filename == pathFilename(data.img))) {
			$('<img>')
				.hide()
				.load(function() {
					terminal.print($('<h3>').text(data.num+": "+data.title));
					$(this).fadeIn();
					terminal.print($(this));
					terminal.setWorking(false);
				})
				.attr({src:data.img, alt:data.title, title:data.alt})
				.addClass('comic');
		} else {
			fail();
		}
	}, fail);
};

TerminalShell.commands['next'] = function(terminal) {
	xkcdDisplay(terminal, xkcd.last.num+1);
};

TerminalShell.commands['previous'] =
TerminalShell.commands['prev'] = function(terminal) {
	xkcdDisplay(terminal, xkcd.last.num-1);
};

TerminalShell.commands['first'] = function(terminal) {
	xkcdDisplay(terminal, 1);
};

TerminalShell.commands['last'] = function(terminal) {
	xkcdDisplay(terminal, xkcd.latest.num);
};

TerminalShell.commands['random'] = function(terminal) {
	xkcdDisplay(terminal, getRandomInt(1, xkcd.latest.num));
};

TerminalShell.commands['goto'] = function(terminal, subcmd) {
	$('#screen').one('cli-ready', function(e) {
		terminal.print('Did you mean "display"?');
	});
	xkcdDisplay(terminal, 292);
};

TerminalShell.commands['cat'] = function(terminal, path) {
	if (path == 'welcome.txt') {
		terminal.print($('<h4>').text('Welcome to the unixkcd console.'));
		terminal.print('To navigate, enter "next", "prev", "first", or "last".');
		terminal.print('Try "help" for more information.');
	} else if (pathFilename(path) == 'alt.txt') {
		terminal.setWorking(true);
		num = Number(path.match(/^\d+/));
		xkcd.get(num, function(data) {
			terminal.print(data.alt);
			terminal.setWorking(false);
		}, function() {
			terminal.print($('<p>').addClass('error').text('cat: "'+path+'": No such file or directory.'));
			terminal.setWorking(false);
		});
	} else {
		terminal.print('You\'re a kitty!');
	}
};

TerminalShell.commands['reddit'] = function(terminal, num) {
	num = Number(num);
	if (num) {
		url = 'http://xkcd.com/'+num+'/';
	} else {
		var url = window.location;
	}
	terminal.print($('<iframe src="http://www.reddit.com/static/button/button1.html?width=140&url='+encodeURIComponent(url)+'&newwindow=1" height="22" width="140" scrolling="no" frameborder="0"></iframe>'));
};

TerminalShell.commands['apt-get'] = function(terminal, subcmd, sudo) {
	if ((sudo!='sudo') && (subcmd in {'update':true, 'upgrade':true, 'dist-upgrade':true})) {
		terminal.print('E: Unable to lock the administration directory, are you root?');
	} else {
		if (subcmd == 'update') {
			terminal.print('Reading package lists... Done');
		} else if (subcmd == 'upgrade') {
			if (($.browser.name == 'msie') || ($.browser.name == 'firefox' || $.browser.versionX < 3)) {
				terminal.print($('<p>').append($('<a>').attr('href', 'http://abetterbrowser.org/').text('To complete installation, click here.')));
			} else {
				terminal.print('This looks pretty good to me.');
			}
		} else if (subcmd == 'dist-upgrade') {
			var longNames = {'win':'Windows', 'mac':'OS X', 'linux':'Linux'};
			var name = $.os.name;
			if (name in longNames) {
				name = longNames[name];
			} else {
				name = 'something fancy';
			}
			terminal.print('You are already running '+name+'.');
		} else if (subcmd == 'moo') {
			terminal.print('        (__)');
			terminal.print('        (oo)');
			terminal.print('  /------\\/ ');
			terminal.print(' / |    ||  ');
			terminal.print('*  /\\---/\\  ');
			terminal.print('   ~~   ~~  '); 
			terminal.print('...."Have you mooed today?"...');
		} else if (!subcmd) {
			terminal.print('This APT has Super Cow Powers.');
		} else {
			terminal.print('E: Invalid operation '+subcmd);
		}
	}
};

TerminalShell.commands['sudo'] = function(terminal) {
	var cmd_args = Array.prototype.slice.call(arguments);
	cmd_args.shift(); // terminal
	var cmd_name = cmd_args.shift();
	cmd_args.unshift(terminal);
	cmd_args.push('sudo');
	if (cmd_name in TerminalShell.commands) {
		this.commands[cmd_name].apply(this, cmd_args);
	} else {
		terminal.print('sudo: '+cmd_name+': command not found');
	}
};

TerminalShell.fallback = function(terminal, cmd) {
	oneliners = {
		'make me a sandwich': 'What? Make it yourself.',
		'sudo make me a sandwich': 'Okay.',
		'i read the source code': '<3',
		'lpr': 'PC LOAD LETTER',
		'hello joshua': 'How about a nice game of Global Thermonuclear War?'
	};
	oneliners['emacs'] = 'You should really use vim.';
	oneliners['vi'] = oneliners['vim'] = 'You should really use emacs.';
	
	cmd = cmd.toLowerCase();
	if (cmd in oneliners) {
		terminal.print(oneliners[cmd]);
	} else if (cmd == "asl" || cmd == "a/s/l") {
		terminal.print(randomChoice([
			'2/AMD64/Server Rack',
			'328/M/Transylvania',
			'6/M/Battle School',
			'48/M/The White House',
			'7/F/Rapture',
			'Exactly your age/A gender you\'re attracted to/Far far away.',
			'7,831/F/Lothlórien',
			'42/M/FBI Field Office'
		]));
	} else {
		return false;
	}
	return true;
};


$(document).ready(function() {
	Terminal.promptActive = false;
	$('#screen').bind('cli-load', function(e) {
		xkcd.get(null, function(data) {
			xkcd.latest = data;
			$('#screen').one('cli-ready', function(e) {
				Terminal.runCommand('cat welcome.txt');
			});
			Terminal.runCommand('display '+xkcd.latest.num+'/'+pathFilename(xkcd.latest.img));
		});
	});
});