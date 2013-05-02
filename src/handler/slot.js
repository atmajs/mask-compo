
function SlotHandler() {}

mask.registerHandler(':slot', SlotHandler);

SlotHandler.prototype = {
	constructor: SlotHandler,
	renderEnd: function(element, model, cntx, container){
		this.slots = {};

		this.expression = this.attr.on;

		this.slots[this.attr.signal] = this.handle;
	},
	handle: function(){
		var expr = this.expression;

		mask.Utils.Expression.eval(expr, this.model, global, this);
	}
};
