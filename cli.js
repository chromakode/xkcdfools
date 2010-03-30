/* 	
 Client-side logic for Wordpress CLI theme
 R. McFarland, 2006, 2007, 2008
 http://thrind.xamai.ca/
 */
var dbg = null;
var displayElement = null;
var screenElement = null;
var promptElement = null;
var spinnerElement = null;
var bottomlineElement = null;
var leftOfCursorElement = null;
var cursorElement = null;
var rightOfCursorElement = null;
var pageAlertElement = null;
var inputBuffer = '';
var cursorPosition = 0;
var cursorBlinkThreadId = false;
var multilineMode = false;
var specialCommandHandler = false;
var specialCommandHandlerCode = false;
var passwordInputMode = false;
var historyArray = [];
var historyIndex = 0;
var clientSideCommandsEnabled = true;
var promptText = "guest@xkcd:/$&nbsp;";
var eatIt = false; // eat next character input
var spinnerCharacters = ['-', '\\', '|', '/'];
var spinnerCharacterIndex = 0;
var spinnerThreadId = false;
var stickyState = {ctrl: false, alt: false, scroll: false}; // for "sticky" modifier keys
var xmlhttp = false;
var interpreter = "interpret.php";
var requestId = 0;
var firstCommand = true;
var waitingForServer = false;
var savedDisplayHTML = false;
var cursorState = 1;
var scrLock = false;
var targetHeight = false;
var scrollerThreadId = false;
var waitingAtPage = false;
var paging = true; // there's no option to turn this off in the options page, but you can chage it here. Make it false for no "--More--"
var initialScreenOffsetHeight = false;
var scrollStep = 10;
var bg_color = "#000";
var fg_color = "#FFF";
var cursor_blink_time = 700;
var cursor_style = "block";
var gui_url = null;

var ENTER = String.fromCharCode(13);
var DOUBLE_QUOTE = String.fromCharCode(34);

function cursorBlink() {
	cursorState = 1 - cursorState;
	if (cursor_style == 'block') {
		if (cursorState == 1) {
			cursorElement.style.color = bg_color;
			cursorElement.style.backgroundColor = fg_color;
		} else {
			cursorElement.style.color = fg_color;
			cursorElement.style.backgroundColor = bg_color;
		}
	} else {
		if (cursorState == 1) {
			cursorElement.style.textDecoration = 'underline';
		} else {
			cursorElement.style.textDecoration = 'none';
		}
	}
}

/**** start from http://snippets.dzone.com/posts/show/701 ****/
// Removes leading whitespaces


function ltrim(value) {
	if (value) {
		var re = /\s*((\S+\s*)*)/;
		return value.replace(re, "$1");
	}
	return '';
}

// Removes ending whitespaces


function rtrim(value) {
	if (value) {
		var re = /((\s*\S+)*)\s*/;
		return value.replace(re, "$1");
	}
	return '';
}

// Removes leading and ending whitespaces


function trim(value) {
	if (value) {
		return ltrim(rtrim(value));
	}
	return '';
} /**** end from http://snippets.dzone.com/posts/show/701 ****/

function prepareInputForDisplay(str) {
	str = str.replace(/&/g, '&amp;'); // keep first
	str = str.replace(/</g, '&lt;');
	str = str.replace(/>/g, '&gt;');
	str = str.replace(/  /g, ' &nbsp;');
	if (/msie/i.test(navigator.userAgent)) {
		str = str.replace("\n", '&nbsp;<br />');
	} else {
		str = str.replace(/\x0D/g, '&nbsp;<br />');
	}
	return str;
}

function updateInputDisplay() {
	var left = '',
		underCursor = ' ',
		right = '';
	if (trim(inputBuffer) === '') {
		inputBuffer = '';
	}
	if (cursorPosition < 0) {
		cursorPosition = 0;
	}
	if (cursorPosition > inputBuffer.length) {
		cursorPosition = inputBuffer.length;
	}
	if (cursorPosition > 0) {
		left = inputBuffer.substr(0, cursorPosition);
	}
	if (cursorPosition < inputBuffer.length) {
		underCursor = inputBuffer.substr(cursorPosition, 1);
	}
	if (inputBuffer.length - cursorPosition > 1) {
		right = inputBuffer.substr(cursorPosition + 1, inputBuffer.length - cursorPosition - 1);
	}

	leftOfCursorElement.innerHTML = prepareInputForDisplay(left);
	cursorElement.innerHTML = prepareInputForDisplay(underCursor);
	if (underCursor == ' ') {
			cursorElement.innerHTML = '&nbsp;';
		}
	rightOfCursorElement.innerHTML = prepareInputForDisplay(right);
	promptElement.innerHTML = promptText;
	return;
}

function clearInputBuffer() {
	inputBuffer = '';
	cursorPosition = 0;
	updateInputDisplay();
}

function setPromptActive(active) {
	if (active) {
		bottomlineElement.style.visibility = 'visible';
		
		return true;
	} else {
		bottomlineElement.style.visibility = 'hidden';
		return false;
	}
}

function pageAlert(active) {
	waitingAtPage = active;
	if (active) {
		pageAlertElement.style.visibility = 'visible';
	} else {
		pageAlertElement.style.visibility = 'hidden';
	}
}

function jumpToBottom() {
	screenElement.scrollTop = screenElement.scrollHeight - screenElement.offsetHeight;
	
}

function jumpToTop() {
	screenElement.scrollTop = screenElement.offsetHeight;
	
}

function backgroundScroller() {
	//	topofscreentotopofviewport	= screenElement.scrollTop;
	// +	viewportheight			= screenElement.offsetHeight;
	// <=	fullheight			= screenElement.scrollHeight;
	if (scrollStep > 0 && (screenElement.scrollHeight - screenElement.offsetHeight > screenElement.scrollTop + scrollStep)) {
		if (!targetHeight || initialScreenOffsetHeight != screenElement.offsetHeight) {
			initialScreenOffsetHeight = screenElement.offsetHeight;
			if (paging) {
				targetHeight = Math.min(screenElement.scrollTop + screenElement.offsetHeight - 40, screenElement.scrollHeight);
			} else {
				targetHeight = screenElement.scrollHeight;
			}
		}
		if (screenElement.scrollTop < targetHeight) {
			screenElement.scrollTop += scrollStep;
			scrollerThreadId = setTimeout(backgroundScroller, 10);
			return;
		} else {
			targetHeight = false;
			scrollerThreadId = false;
			pageAlert(true);
		}
	} else {
		screenElement.scrollTop = screenElement.scrollHeight - screenElement.offsetHeight;
		targetHeight = false;
		scrollerThreadId = false;
		pageAlert(false);
		jumpToBottom();
	}
}

function scroller() {
	initialScreenOffsetHeight = screenElement.offsetHeight;
	if (!waitingAtPage && !scrollerThreadId) {
		scrollerThreadId = setTimeout(backgroundScroller, 10);
	}
	return;
}

function appendToDisplay(html) {
	displayElement.innerHTML += html;
	scroller();
}

function displayFromXML(xdisplayData) {
	var html = '';
	for (var i = 0; i < xdisplayData.length; i++) {
		if (xdisplayData[i].firstChild) {
			html += xdisplayData[i].firstChild.data;
		}
	}
	appendToDisplay(html);
}

function initializeSpecialCommandHandler(xspecialCommandHandler) {
	for (var i = 0; i < xspecialCommandHandler.length; i++) {
		if (xspecialCommandHandler[i].firstChild) {
			specialCommandHandlerCode += xspecialCommandHandler[i].firstChild.data;
		}
	}
	if (specialCommandHandlerCode == '0') {
		specialCommandHandler = false;
		specialCommandHandlerCode = false;
	} else {
		specialCommandHandler = function (input) {
			eval(specialCommandHandlerCode);
			return false;
		};
		specialCommandHandler('__INIT__');
	}
}

function handleServerXML(xml) {
	if (!xml) {
		return false;
	}
	var xmlDocumentElement = xml.documentElement;
	if (!xmlDocumentElement) {
		return false;
	}
	/* 
	 //for some weird-ass reason some people's servers are responding with empty responseId's
	 xresponseId = xmlDocumentElement.getElementsByTagName('responseId');
	 if (xresponseId.length == 0 || (xresponseId[0].getAttribute('value') != requestId)){ 
	 // to avoid confusion with slow-arriving results
	 alert('Out-of-order or malformed server response');
	 return false;
	 }
	 */
	var xmultilineMode = xmlDocumentElement.getElementsByTagName('multiline');
	if (xmultilineMode.length > 0 && xmultilineMode[0].getAttribute('value') == "1") {
		multilineMode = true;
	}

	var xclientSideCommandsEnabled = xmlDocumentElement.getElementsByTagName('clientsidecommands');
	if (xclientSideCommandsEnabled.length > 0 && xclientSideCommandsEnabled[0].getAttribute('value') == "off") {
		clientSideCommandsEnabled = false;
	} else {
		clientSideCommandsEnabled = true;
	}

	var xcommandlineData = xmlDocumentElement.getElementsByTagName('commandline');
	if (xcommandlineData.length > 0) {
		inputBuffer = xcommandlineData[0].firstChild.data;
		cursorPosition = inputBuffer.length;
	} else {
		inputBuffer = '';
		cursorPosition = 0;
	}

	var xprompt = xmlDocumentElement.getElementsByTagName('prompt');
	if (xprompt && xprompt[0]) {
		promptText = xprompt[0].firstChild.data;
	}

	var xdisplayData = xmlDocumentElement.getElementsByTagName('display');
	if (xdisplayData.length > 0) {
		displayFromXML(xdisplayData);
	}

	var xspecialCommandHandler = xmlDocumentElement.getElementsByTagName('specialcommandhandler');
	if (xspecialCommandHandler.length > 0) {
		initializeSpecialCommandHandler(xspecialCommandHandler);
	}

	updateInputDisplay();
	return true;
}

function createXMLHTTP() { /* I stole this from somebody a long time ago. Sorry, somebody. */
	/*@cc_on @*/
	/*@if (@_jscript_version >= 5)
	 try {
	 xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	 } catch (e) {
	 try {
	 xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	 } catch (E) {
	 xmlhttp = false;
	 }
	 }
	 @end @*/
	if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
		xmlhttp = new XMLHttpRequest();
	}
}

function prepareURI(what) {
	what = encodeURI(what);
	what = what.replace(/&amp;/g, '%26');
	what = what.replace(/&lt;/g, '<');
	return what;
}

function busySpinner(active) {
	if (active) {
		if (spinnerElement) {
			spinnerCharacterIndex = (++spinnerCharacterIndex) % spinnerCharacters.length;
			spinnerElement.innerHTML = spinnerCharacters[spinnerCharacterIndex];
			if (!spinnerThreadId) {
				spinnerElement.style.display = 'block';
				spinnerThreadId = setInterval('busySpinner(true);', 100);
			}
		}
	} else {
		spinnerElement.style.display = 'none';
		clearInterval(spinnerThreadId);
		spinnerThreadId = false;
	}
}

function executeCommand(getCommand, postData) {
	multilineMode = false;
	if (!xmlhttp) {
		createXMLHTTP();
	}
	if (!xmlhttp) {
		alert('Darn.');
		return false;
	}
	if (firstCommand) {
		firstCommand = false;
	} else {
		requestId = Math.round(Math.random() * 100000);
	}
	var url = interpreter + "?" + prepareURI(getCommand) + "&requestId=" + requestId + "&" + phpsessname + "=" + phpsessid;
	if (postData) {
		xmlhttp.open("POST", url, true);
		xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	} else {
		xmlhttp.open("GET", url, true);
	}
	xmlhttp.onreadystatechange = function () {
		var xstate = xmlhttp.readyState;
		if (xstate == 4 && xmlhttp.status == 200) {
			waitingForServer = false;
			busySpinner(false);
			handleServerXML(xmlhttp.responseXML);
			scroller();
			setPromptActive(true);
			return true;
		}
		return false;
	};
	waitingForServer = true;
	busySpinner(true);
	if (postData) {
		xmlhttp.send(prepareURI(postData));
	} else {
		xmlhttp.send("");
	}
	return false;
}

commands = {
	ls: function ls(which) {
		executeCommand('c=ls ' + which, false);
	},
	help: function help(what) {
		executeCommand('c=help ' + what, false);
	}
};

function processInputBuffer(input) {
	clearInputBuffer();

	/* redisplay command in display div */
	var inputForDisplay = input;
	if (passwordInputMode) {
		inputForDisplay = "";
		for (var i = 0; i < input.length; i++) {
			inputForDisplay += '*';
		}
	}
	appendToDisplay("<p>" + promptText + prepareInputForDisplay(inputForDisplay) + '</p>');

	input = trim(input);
	
	if (input.length == 0) {
		return false;
	}

	/* for weird local-only interaction, maybe editor */
	if (specialCommandHandler) {
		specialCommandHandler(input);
		setPromptActive(true);
		return false;
	}

	if (clientSideCommandsEnabled) { /* add to history */
		if (input !== '') {
			historyArray[historyArray.length] = input;
			historyIndex = historyArray.length;
		}
		var possibleCommand = input.toLowerCase(); /*LOCALLY EVALUATED COMMANDS */
		//CLS
		if (possibleCommand == 'cls' || possibleCommand == 'clear' || possibleCommand == 'reset') {
			displayElement.innerHTML = '<p></p>';
			return false;
		}
		//HISTORY
		if (possibleCommand == 'history') {
			var text = '<p>';
			for (i = 0; i < historyArray.length; i++) {
				text += '<span class="linky" onclick="executeCommand(\'c=' + historyArray[i] + '\',false);">';
				text += historyArray[i] + '</span><br />';
			}
			text += '</p>';
			appendToDisplay(text);
			return false;
		}
		//STARTX
		if (possibleCommand == 'gui' || possibleCommand == 'startx') {
			if (gui_url) {
				document.location.href = gui_url;
			} else {
				alert('No GUI link configured!');
			}
			return false;
		} /* END LOCALLY EVALUATED COMMANDS */
	}
	/*setPromptActive(false);
	executeCommand("c=" + input, false);*/
	commandNotFound();
	return false;
}

function scrollPage(mul) {
	screenElement.scrollTop += mul * screenElement.offsetHeight;
	return false;
}

function scrollLine(mul) {
	screenElement.scrollTop += mul * scrollStep;
	return false;
}

function setcl(addend) {
	inputBuffer += addend;
	cursorPosition = inputBuffer.length;
	//updateInputDisplay();
	processInputBuffer(inputBuffer);
}

function commandNotFound() {
	appendToDisplay("<p>Unrecognized command. Type 'help' for assistance.</p>");
}

function toggleStickyModifierKey(key) {
	var indicator;
	stickyState[key] = !stickyState[key];
	indicator = $("#"+key+"-indicator");
	if (stickyState[key]) {
		indicator.show();
	} else {
		indicator.hide();
	}
	return true;
}

function handleKeyEvent(e) {
	if (waitingForServer) {
		return rval;
	}
	
	if (e.which >= 32 && e.which <= 126) {   
		character = String.fromCharCode(e.which);
		if (!(stickyState.CTRL || stickyState.ALT)) {
			if (character) { // if it's a regular key
				if (eatIt) {
					character = '';
					eatIt = false;
				}
				left = inputBuffer.substr(0, cursorPosition);
				right = inputBuffer.substr(cursorPosition, inputBuffer.length - cursorPosition);
				inputBuffer = left + character + right;
				cursorPosition++;
				updateInputDisplay();
			}
		}
	}
	
	return false;
	
	if (multilineMode) {
		scroller();
	}
	if (character) {
		keyName = character;
	} else if (keycodes[keyCode]) { // in keycodes.js -- is named.
		keyName = keycodes[keyCode];
	} else {
		return rval;
	}

	if (keyName == 'SHIFT') {
		return rval;
	}
	if (keyName == 'ALT' || keyName == 'CTRL') {
		toggleStickyModifierKey(keyName, e);
		return rval;
	}
	if (e && ((e.type == 'keyup') || (e.type == 'keypress'))) {
		return rval;
	}
	if (e && e.shiftKey) {
		keyName = 'SHIFT_' + keyName;
	}
	if (stickyState.CTRL || stickyState.ALT) {
		eatIt = true;
		character = '';
	}
	if ((e && e.ctrlKey) || stickyState.CTRL) {
		e.returnValue = false;
		keyName = 'CTRL_' + keyName;
		toggleStickyModifierKey('CTRL', null);
	}
	if ((e && e.altKey) || stickyState.ALT) {
		e.returnValue = false;
		keyName = 'ALT_' + keyName;
		toggleStickyModifierKey('ALT', null);
	}
	if (keyName == 'ALT_CTRL_q') { // Wilkommen, Deutsches freunden
		if (eatIt) {
			character = '';
			eatIt = false;
		} else {
			left = inputBuffer.substr(0, cursorPosition);
			right = inputBuffer.substr(cursorPosition, inputBuffer.length - cursorPosition);
			inputBuffer = left + '@' + right;
			cursorPosition++;
			updateInputDisplay();
			return rval;
		}
	}
	if (keyName == 'BACKSPACE' || keyName == 'CTRL_h') { // ^h fires up the history pane in FF.
		e.returnValue = false;
		if (cursorPosition > 0) {
			
			left = inputBuffer.substr(0, cursorPosition - 1);
			right = inputBuffer.substr(cursorPosition, inputBuffer.length - cursorPosition);
			inputBuffer = left + right;
			cursorPosition--;
			updateInputDisplay();
		}
		return false;
	}

	if (keyName == 'DEL' || keyName == 'SHIFT_BACKSPACE') {
		e.returnValue = false;
		if (cursorPosition < inputBuffer.length) {
			left = inputBuffer.substr(0, cursorPosition);
			right = inputBuffer.substr(cursorPosition + 1, inputBuffer.length - cursorPosition - 1);
			inputBuffer = left + right;
			updateInputDisplay();
		}
		return rval;
	}
	if (keyName == 'CTRL_c') {
		if (specialCommandHandler) {
			specialCommandHandler('__CANCEL__');
		} else {
			executeCommand('cancel=1', false);
		}
		clearInputBuffer();
		return rval;
	}

	if (multilineMode) {
		if (keyName == 'CTRL_x') { // end multilineMode input
			if (specialCommandHandler) {
				specialCommandHandler('__EXIT__');
			} else {
				executeCommand('c=', 'p=' + prepareURI(inputBuffer));
			}
			clearInputBuffer();
			return rval;
		}
		if (keyName == 'UP') {
			if (inputBuffer.charCodeAt(cursorPosition) == 13) {
				cursorPosition++;
			}
			var previousNewline = inputBuffer.lastIndexOf(ENTER, cursorPosition - 1);
			var previousPreviousNewline = inputBuffer.lastIndexOf(ENTER, previousNewline - 1);
			if (previousNewline < 0) {
				previousNewline = 0;
				previousPreviousNewline = 0;
			}
			if (previousPreviousNewline < 0) {
				previousPreviousNewline = 0;
			}
			cursorPosition = previousPreviousNewline + cursorPosition - previousNewline;
			if (cursorPosition > previousNewline) {
				cursorPosition = previousNewline - 1;
			}
			updateInputDisplay();
			return rval;
		}
		if (keyName == 'DOWN') {
			if (inputBuffer.charCodeAt(cursorPosition) == 13) {
				cursorPosition--;
			}
			var previousNewline = Math.max(0, inputBuffer.lastIndexOf(ENTER, cursorPosition - 1));
			var nextNewline = inputBuffer.indexOf(ENTER, cursorPosition + 1);
			var nextNextNewline = inputBuffer.indexOf(ENTER, nextNewline + 1);
			if (nextNewline < 0) {
				nextNewline = inputBuffer.length;
				nextNextNewline = nextNewline;
			}
			if (nextNextNewline < 0) {
				nextNextNewline = inputBuffer.length;
			}
			cursorPosition = nextNewline + cursorPosition - previousNewline;
			if (cursorPosition > nextNextNewline) {
				cursorPosition = nextNextNewline;
			}
			updateInputDisplay();
			return rval;
		}
		if (keyName == 'ENTER' || keyCode == 13) {
			left = inputBuffer.substr(0, cursorPosition);
			right = inputBuffer.substr(cursorPosition);
			inputBuffer = left + ENTER + right;
			cursorPosition++;
			updateInputDisplay();
			return rval;
		}
		if (keyName == 'CTRL_a' || keyName == 'HOME') {
			if (inputBuffer.charCodeAt(cursorPosition) == 13) {
				cursorPosition--;
			}
			var ocursorPosition = cursorPosition;
			cursorPosition = inputBuffer.lastIndexOf(ENTER, cursorPosition) + 1;
			if (cursorPosition >= ocursorPosition) {
				cursorPosition = 0;
			}
			updateInputDisplay();
			return rval;
		}
		if (keyName == 'CTRL_e' || keyName == 'END') {
			if (inputBuffer.charCodeAt(cursorPosition) == 13) {
				cursorPosition++;
			}
			var ocursorPosition = cursorPosition;
			cursorPosition = inputBuffer.indexOf(ENTER, cursorPosition);
			if (cursorPosition <= ocursorPosition) {
				cursorPosition = inputBuffer.length;
			}
			updateInputDisplay();
			return rval;
		}
		if (keyName == 'TAB') {
			left = inputBuffer.substr(0, cursorPosition);
			right = inputBuffer.substr(cursorPosition);
			inputBuffer = left + '	' + right; // 4 spaces 
			cursorPosition += 4;
			updateInputDisplay();
			return rval;
		}
	} else { //not multilineMode
		if ((keyName == 'CTRL_a' || keyName == 'HOME') && cursorPosition > 0) {
			cursorPosition = 0;
			updateInputDisplay();
			return rval;
		}
		if ((keyName == 'CTRL_e' || keyName == 'END') && cursorPosition < inputBuffer.length) {
			cursorPosition = inputBuffer.length;
			updateInputDisplay();
			return rval;
		}
		if (keyName == 'CTRL_l') { // well, maybe some browser catches it
			displayElement.innerHTML = '';
			return rval;
		}
		if (keyName == 'SCRLOCK') {
			scrLock = !scrLock;
			document.getElementById('SCRLOCKindicator').style.display = (scrLock ? 'inline' : 'none');
		}
		if (keyName == 'UP' || keyName == 'SHIFT_UP') {
			if (scrLock || keyName == 'SHIFT_UP') {
				scrollLine(-1);
			} else if (historyIndex > 0) {
				historyIndex--;
				inputBuffer = historyArray[historyIndex];
				cursorPosition = inputBuffer.length;
				updateInputDisplay();
				jumpToBottom();
			}
			return rval;
		}
		if (keyName == 'DOWN' || keyName == 'SHIFT_DOWN') {
			if (scrLock || keyName == 'SHIFT_DOWN') {
				scrollLine(1);
			} else if (historyIndex < historyArray.length) {
				if (historyIndex == historyArray.length - 1) {
					historyIndex = historyArray.length;
					clearInputBuffer();
				} else {
					inputBuffer = historyArray[++historyIndex];
				}
				cursorPosition = inputBuffer.length;
				updateInputDisplay();
				jumpToBottom();
			}
			return rval;
		}
		if (keyName == 'PGUP' || keyName == 'CTRL_UP') {
			scrollPage(-1);
			return rval;
		}
		if (keyName == 'PGDN' || keyName == 'CTRL_DOWN') {
			scrollPage(1);
			return rval;
		}
		if (keyName == 'CTRL_HOME') {
			jumpToTop();
			return rval;
		}
		if (keyName == 'CTRL_END') {
			jumpToBottom();
			return rval;
		}
		if (keyName == 'TAB') {
			executeCommand('tc=' + inputBuffer, false); // tab completion
			return rval;
		}
		if (keyName == 'SHIFT_TAB') {
			return rval;
		}
		if (keyName == 'ENTER' || keyCode == 13) {
			processInputBuffer(inputBuffer);
			return rval;
		}
	}
	return rval;
}

function initializeCLI() {
	$(document)
		.keypress(function(e) {
			if (e.which >= 32 && e.which <= 126) {   
				character = String.fromCharCode(e.which);
				if (!(stickyState.ctrl || stickyState.alt)) {
					if ($.browser.opera && $.hotkeys.specialKeys[e.which]
					                       in {left:true, up:true, right:true, down:true} ) {
						return // sigh.
					}
					if (character) {
						if (eatIt) {
							character = '';
							eatIt = false;
						}
						left = inputBuffer.substr(0, cursorPosition);
						right = inputBuffer.substr(cursorPosition, inputBuffer.length - cursorPosition);
						inputBuffer = left + character + right;
						cursorPosition++;
						updateInputDisplay();
					}
				} else if (stickyState.ctrl) {
					if (character == "w") {
						if (cursorPosition > 0) {
							var ncp = cursorPosition;
							while (ncp > 0 && inputBuffer.charAt(ncp) !== ' ') {
								ncp--;
							}
							left = inputBuffer.substr(0, ncp - 1);
							right = inputBuffer.substr(ncp, inputBuffer.length - cursorPosition);
							inputBuffer = left + right;
							cursorPosition = ncp;
							updateInputDisplay();
						}
						toggleStickyModifierKey("ctrl");						
					}
					
				} else if (stickyState.alt) {
					
				}
			}
		})
		.bind("keydown", "backspace", function(e) {
			e.preventDefault();
			if (cursorPosition > 0) {
				left = inputBuffer.substr(0, cursorPosition - 1);
				right = inputBuffer.substr(cursorPosition, inputBuffer.length - cursorPosition);
				inputBuffer = left + right;
				cursorPosition--;
				updateInputDisplay();
			}
		})
		.bind("keydown", "ctrl", function(e) { toggleStickyModifierKey("ctrl"); })
		.bind("keydown", "alt", function(e) { toggleStickyModifierKey("alt"); })
		.bind("keydown", "scroll", function(e) { toggleStickyModifierKey("scroll"); })
		.bind("keydown", "left", function(e) {
			e.stopPropagation();
			if (cursorPosition > 0) {
				cursorPosition--;
				updateInputDisplay();
			}
		})
		.bind("keydown", "right", function(e) {
			e.stopPropagation();
			if (cursorPosition < inputBuffer.length) {
				cursorPosition++;
				updateInputDisplay();
			}
		});
	screenElement = document.getElementById('scr');
	displayElement = document.getElementById('display');
	spinnerElement = document.getElementById('spinnerdiv');
	promptElement = document.getElementById('prompt');
	bottomlineElement = document.getElementById('bottomline');
	leftOfCursorElement = document.getElementById('lcommand');
	cursorElement = document.getElementById('undercsr');
	rightOfCursorElement = document.getElementById('rcommand');
	pageAlertElement = document.getElementById('pagealert');
	if (!cursorBlinkThreadId) {
		cursorBlinkThreadId = setInterval(cursorBlink, cursor_blink_time);
	}

	promptElement.innerHTML = promptText;
	screenElement.scrollTop = 1;

	spacerElement = document.createElement("div");
	spacerElement.style.height = screenElement.offsetHeight + "px";
	displayElement.insertBefore(spacerElement, displayElement.firstChild);
}

$(document).ready(function(){
	$("#welcome").show();
	// Kill Opera's backspace keyboard action.
	document.onkeydown = document.onkeypress = function(e) { return $.hotkeys.specialKeys[e.keyCode] != "backspace"; };
	initializeCLI();
	scroller();
});