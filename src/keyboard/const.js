var CODES, SHIFT_NUMS, MODS;

CODES = {
	"backspace": 8,
	"tab": 9,
	"return": 13,
	"enter": 13,
	"shift": 16,
	"ctrl": 17,
	"control": 17,
	"alt": 18,
	"option": 18,
	
	"fn": 255,
	
	"pause": 19,
	"capslock": 20,
	"esc": 27,
	"escape": 27,
	
	"space": 32,
	"pageup": 33,
	"pagedown": 34,
	"end": 35,
	"home": 36,
	"start": 36,
	
	"left": 37,
	"up": 38,
	"right": 39,
	"down": 40,
	
	"insert": 45,
	"ins": 45,
	"del": 46,
	"numlock": 144,
	"scroll": 145,
	
	"f1": 112,
	"f2": 113,
	"f3": 114,
	"f4": 115,
	"f5": 116,
	"f6": 117,
	"f7": 118,
	"f8": 119,
	"f9": 120,
	"f10": 121,
	"f11": 122,
	"f12": 123,
	
	";": 186,
	"=": 187,
	"*": 106,
	"+": 107,
	"plus": 107,
	"-": 109,
	"minus": 109,
	".": 190,
	"/": 191,
	
	",": 188,
	"`": 192,
	"[": 219,
	"\\": 220,
	"]": 221,
	"'": 222
};

SHIFT_NUMS = {
  "`": "~",
  "1": "!",
  "2": "@",
  "3": "#",
  "4": "$",
  "5": "%",
  "6": "^",
  "7": "&",
  "8": "*",
  "9": "(",
  "0": ")",
  "-": "_",
  "=": "+",
  ";": ": ",
  "'": "\"",
  ",": "<",
  ".": ">",
  "/": "?",
  "\\": "|"
};

MODS = {
	'16': 'shiftKey',
	'17': 'ctrlKey',
	'18': 'altKey',
};