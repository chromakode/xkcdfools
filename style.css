<?php 
include('../../cli.conf.php');
header('Content-Type: text/css',true,200);
?>
/*
	CLI 2.0 Stylesheet

	Now dynamic to support changing colours in the configuration.

*/
html,body{
	height:99%;
}

body{
	background-color:<?php echo BORDER_COLOUR ?>;
	font-family:"<?php echo get_option(THEME_OPTION_PREFIX.'font') ?>","Courier New",Courier,monospace;
	padding:0;
	margin:0;
	overflow:hidden;
} 

pre, td, th, p, div{
	color:<?php echo FG_COLOUR ?>;
	font-family:"<?php echo get_option(THEME_OPTION_PREFIX.'font') ?>","Courier New",Courier,monospace;
	font-size:1em;
}

div#scr{
	background-color:<?php echo BG_COLOUR ?>;
	height:99%;
	margin:<?php echo get_option(THEME_OPTION_PREFIX.'br_width') ?>px;
	padding:0;
	overflow:hidden;
	<?php if(get_option(THEME_OPTION_PREFIX.'sidebar')=='left'){ ?>
	padding-left:<?php echo get_option(THEME_OPTION_PREFIX.'br_width') ?>px;
	<?php }else if(get_option(THEME_OPTION_PREFIX.'sidebar')=='right'){ ?>
	padding-right:<?php echo get_option(THEME_OPTION_PREFIX.'br_width') ?>px;
	<?php } ?>
}

div#d_and_c{
	background-color:<?php echo BG_COLOUR ?>;
	margin:0;
	padding:0;
}

div#display{
}

p, pre, div, table{
	margin-top:0em;
	margin-bottom:1em;
}

pre, td, p{
	background-color:transparent;
}

code,p,span,td,th{
	font-size:1em;
}
h1, h2, h3, h4, h5, h6{
	background-color:<?php echo FG_COLOUR ?>;
	color:<?php echo BG_COLOUR ?>;
}

a, a:visited, .linky{
	color:<?php echo FG_COLOUR ?>;
	text-decoration:none;
	font-weight:bold;
	cursor:pointer;
}

a:hover, span.linky:hover, td.linky:hover{ /*you poor IE-using bastards*/
	color:<?php echo BG_COLOUR ?>;
	background-color:<?php echo FG_COLOUR ?>;
}

table{
	border-collapse:collapse;
}

td{
	padding:0 1em 0 1em;
}

.stealth{
	color:<?php echo BG_COLOUR ?>;
	color:black;
	background-color:<?php echo BG_COLOUR ?>;
	width:0px;
	height:0px;
	border:0px;
}

a#undercsr{
	font-weight:normal;
<?php if(get_option(THEME_OPTION_PREFIX.'cursor_style') == 'underline'){ ?>
	text-decoration:underline;
<?php } ?> 
}
div#pagealert{
	position:absolute;
	bottom:0px;
	margin:0;
	padding:0;
	left:<?php echo get_option(THEME_OPTION_PREFIX.'br_width') ?>px;
	bottom:<?php echo get_option(THEME_OPTION_PREFIX.'br_width') ?>px;
	width:auto;
	text-align:center;
	background-color:<?php echo FG_COLOUR ?>;
	color:<?php echo BG_COLOUR ?>;
	visibility:hidden;
}
div#indicators{
	position:absolute;
	bottom:<?php echo get_option(THEME_OPTION_PREFIX.'br_width') ?>px;
	bottom:0px;
	left:<?php echo get_option(THEME_OPTION_PREFIX.'br_width') ?>px;
	margin:0;
	padding:0;
	text-align:center;
}
span#ALTindicator,span#CTRLindicator,span#SCRLOCKindicator{
	display:none;
	background-color:<?php echo FG_COLOUR ?>;
	color:<?php echo BG_COLOUR ?>;
}
div#spinnerdiv{
	position:absolute;
	bottom:<?php echo get_option(THEME_OPTION_PREFIX.'br_width') ?>px;
	left:<?php echo get_option(THEME_OPTION_PREFIX.'br_width') ?>px;
	margin:0;
	padding:0;
	text-align:center;
}
div#cform{
	position:absolute;
	top:0;
	left:0;
	height:1px;
	width:1px;
}

img{ /* for broken images */
	color: <?php echo FG_COLOUR ?>;
	font-size:x-small;
}

div#leftcol{
	float:left;
	width:auto;
	background-color:<?php echo BG_COLOUR ?>;
	height:100%;
	overflow:auto;
}

div#rightcol{
	float:right;
	width:auto;
	background-color:<?php echo BG_COLOUR ?>;
	height:100%;
	overflow:auto;
}

form#searchform input[type=text]{
	background-color:<?php echo BG_COLOUR ?>;
	color:<?php echo FG_COLOUR ?>;
	border:1px solid <?php echo FG_COLOUR ?>;
	font-family:"<?php echo get_option(THEME_OPTION_PREFIX.'font') ?>","Courier New",Courier,monospace;
	width:100px;
}

form#searchform input[type=submit]{
	background-color:<?php echo FG_COLOUR ?>;
	color:<?php echo BG_COLOUR ?>;
	border:1px solid <?php echo BG_COLOUR ?>;
	font-size:1em;
	font-family:"<?php echo get_option(THEME_OPTION_PREFIX.'font') ?>","Courier New",Courier,monospace;
}

div#credit{
	font-size:xx-small;
	color:<?php echo FG_COLOUR ?>;
}
div#credit a{
	font-size:xx-small;
	color:<?php echo FG_COLOUR ?>;
	text-decoration:underline;
}