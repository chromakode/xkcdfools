var XKCD = {
	latest: null
};

function getXKCD(num, success, error) {
	if (num == null) {
		path = '/proxy.php?mode=native&url=http://xkcd.com/info.0.json';
	} else if (Number(num)) {
		path = '/proxy.php?mode=native&url=http://xkcd.com/'+num+'/info.0.json';
	} else {
		return false;
	}
	
	return $.ajax({
		url: window.location+path,
		dataType: 'json',
		success: success,
		error: error});
}

/*TerminalCommandHandler.commands["ls"] = function(terminal, path) {
	if (path) {
		
	} else {
		
	}
};*/

TerminalCommandHandler.commands["display"] = function(terminal, num) {
	terminal.setWorking(true);
	getXKCD(num, function(data) {
		terminal.print($('<h3>').text(data.title));
		$('<img>')
			.attr({src:data.img, alt:data.title, title:data.alt})
			.hide()
			.load(function() {
				terminal.setWorking(false);
				$(this).fadeIn();
				terminal.print($(this));
			});
		
	}, function() {
		terminal.print($('<p>').addClass('error').text('display: unable to open image '+num+': No such file or directory.'));
		terminal.setWorking(false);
	});
};

$(document).ready(function() {
	$('#screen').bind('cli-ready', function(e) {
		getXKCD(null, function(data) {
			XKCD.latest = data.num;
			Terminal.runCommand("display " + XKCD.latest, 500);
		});
	});
});