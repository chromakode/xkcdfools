var XKCD = {
	latest: null
}

function getXKCD(num, success, error) {
	return $.ajax({
		url: window.location+'/proxy.php?mode=native&url=http://xkcd.com'+(num ? '/'+num : '')+'/info.0.json',
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
	if (Number(num) !== NaN) { 
		getXKCD(num, function(data) {
			terminal.print($('<h3>').text(data.title));
			terminal.print($('<img>').attr({src:data.img, alt:data.title, title:data.alt}));
			terminal.setWorking(false);
		}, function() {
			terminal.print($('<p>').addClass('error').text('display: unable to open image '+num+': No such file or directory.'));
			terminal.setWorking(false);
		});
	}
};

$(document).ready(function() {
	$('#screen').bind('cli-ready', function(e) {
		getXKCD("", function(data) {
			XKCD.latest = data.num;
			Terminal.runCommand("display " + XKCD.latest, 500);
		});
	});
});