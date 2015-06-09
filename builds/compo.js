// import /src/umd-head.js
	
	var log_warn = console.warn.bind(console);
	var log_error = console.error.bind(console);
	var mask_merge = mask.merge;
	var reporter_createErrorNode = function(msg){
		return mask.parse("div > '''" + msg + "'''");;
	}
	
	// import /ref-utils/lib/utils.embed.js
	
	// import /src/scope-vars.js

	// import /src/util/exports.js

	// import /src/compo/children.js
	// import /src/compo/events.js
	// import /src/compo/events.deco.js
	// import /src/compo/pipes.js
	
	// import /src/keyboard/Handler.js
	// import /src/touch/Handler.js
	
	// import /src/compo/anchor.js
	// import /src/compo/Compo.js
	
	// import /src/signal/exports.js

	// import /src/DomLite.js
	// import /src/jcompo/jCompo.js

	// import /src/handler/slot.js


	return Compo;
}));
