/* 
mostly this is here for the control characters. event.keyCode
is actually a keyboard scancode of some sort, so it's a fool's errand 
to try to translate keyCode (which, charCode) to actual characters. 
Despite what the websites will tell you. The strategy used here is to 
use a hidden textarea to collect characters. It goes:

-event fires
-does textarea have a character in it?
	-use that character, clear the textarea, done
-is it a keyup event?
	- yes: exit
-construct a name for the keypress: [ALT_][CTRL_][SHIFT_]keyname
-act (or not) on the name

-Note the browser reserves a *lot* of keys. 
*/
var keycodes={
	1:'CTRL_a',
	2:'CTRL_b', // bookmark, Konq
	3:'CTRL_c',
	4:'CTRL_d', // "duplicate", i guess (Konq), bookmark FF
	5:'CTRL_e',
	6:'CTRL_f', // Konq/FF find text
	7:'CTRL_g',
	8:'BACKSPACE', // safari traps this
	9:'TAB', // also CTRL_i = page info
	10:'CTRL_j',
	11:'CTRL_k',
	12:'CTRL_l', // location bar, FF&K 
	13:'ENTER',
	14:'CTRL_n', // new, FF,K
	15:'CTRL_o', // Open, K&FF
	16:'SHIFT', // CTRL_p = print
	17:'CTRL', //CTRL_q = quit
	18:'ALT', //CTRL_r = reload, K
	19:'CTRL_s', // and 'BREAK',
	20:'CAPSLOCK', // CTRL_t=new tab K,FF
	21:'CTRL_u',
	22:'CTRL_v',
	23:'CTRL_w', // = close (tab) K
	24:'CTRL_x',
	25:'CTRL_y',
	26:'CTRL_z',
	27:'ESC',
	28:'LEFT', //iCab
	29:'RIGHT', //iCab
	30:'UP', //iCab
	31:'DOWN', //iCab
	32:' ',
	33:'PGUP', //=!(Konq)
	34:'PGDN',
	35:'END', //=#(Konq)
	36:'HOME', //=$(Konq)
	37:'LEFT', //=%(Konq)
	38:'UP', //=&(Konq)
	39:'RIGHT',
	40:'DOWN', //=((Konq)
	41:')', //Konq
	42:'*', //Konq
	43:'+',
	44:'SYSRQ',
	45:'INS', // or -
	46:'DEL', // or .
	47:'/',
	48:'0',
	49:'1',
	50:'2',
	51:'3',
	52:'4',
	53:'5',
	54:'6',
	55:'7',
	56:'8',
	57:'9',
	59:';',
	61:'=',

	64:'@',
	65:'a',
	66:'b',
	67:'c',
	68:'d',
	69:'e',
	70:'f',
	71:'g',
	72:'h',
	73:'i',
	74:'j',
	75:'k',
	76:'l',
	77:'m',
	78:'n',
	79:'o',
	80:'p',
	81:'q',
	82:'r',
	83:'s',
	84:'t',
	85:'u',
	86:'v',
	87:'w',
	88:'x',
	89:'y',
	90:'z',

	96:'NUM_0',
	97:'NUM_1',
	98:'NUM_2',
	99:'NUM_3',
	100:'NUM_4',
	101:'NUM_5',
	102:'NUM_6',
	103:'NUM_7',
	104:'NUM_8',
	105:'NUM_9',
	106:'NUM_*', //=^(Konq)
	107:'NUM_+',
	109:'-',
	110:'NUM_.',
	111:'NUM_/',
	112:'F1', //help
	113:'F2', 
	114:'F3', // find again
	115:'F4',
	116:'F5', // reload
	117:'F6', // location bar
	118:'F7', 
	119:'F8',
	120:'F9',
	121:'F10',
	122:'F11',
	123:'F12',
	126:'~',
	127:'DEL',
	144:'NUMLOCK',
	145:'SCRLOCK',
	186:';', // Mac
	187:'=', // Mac
	188:',',
	189:'_', // Mac
	190:'.',
	191:'/',
	192:'`',
	219:'[',
	221:']',
	220:'\\',
	222:'\'',
	225:'WIN', // safari 3.1
	228:'MENU', // safari 3.1
	63232: 'UP', //safari
	63233: 'DOWN', //safari
	63234: 'LEFT', //safari
	63235: 'RIGHT', //safari
	63273: 'HOME', //safari
	63275: 'END', //safari
	63276: 'PGUP', //safari
	63277: 'PGDN' //safari
};

