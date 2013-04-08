###Extends MaskJS: MVC Library for MaskJS
----

####Component

````css
customPanel {
	input#name value='' placeholder='Enter name';
	button x-signal='submit' > 'Submit'
}
````
````javascript
mask.registerHandler('customPanel', Compo({
	slots: {
		submit: function(event){
		    // this references to current customPanel instance
		},
		// ...
	},
	events: {
		'change: input#name' : function(event){
			this.name = this.compos.nameInput.val();
		},
		// ...
	},
	compos: {
		nameInput: '$: input#name',
		// ...
	},
	nodes: // [after init] (Mask DOM) Underlined nodes from template.
	attr: // [after init] Attributes from template.
	/**
	 * (optional) [usual usage]
	 * This method is called by mask builder before component starts rendering.
	 */
	onRenderStart: function(model, cntx, container){
		this.model = { x : 1 }; // override model;
	},
	
	/**
	 * (optional) [pro usage]
	 * This method is called by mask builder before component is rendered.
	 * If you override this method, make sure to call base renderStart of Compo,
	 * to ensure proper component preparation
	 */
	renderStart: function(model, cntx, container){
	    // manipulate with model, container, cntx, this.nodes, etc.

		this.base_renderStart(arguments);
		// or you can override model, or cntx, or container with
		// this.base_renderStart(otherModel, cntx, container);

		// as example wrap current markup with div container with some class
		jmask(this.nodes).wrapAll('.containerPanel;');
	},
	/**
	 * (optional) [pro]
	 * If you define this method, then make sure to render underlined nodes yourself, and renderEnd is not more called.
	 */
	render: function(model, cntx, container){
		// ...
	},

	/**
	 * (optinal) [usual usage]
	 *
	 */
	onRenderEnd: function(elements, model, cntx, container){
		// this.$ is already ready to use
		// this.compos are ready
		// this.events already bound
	}
	/**
	 * (optional) [pro usage]
	 * Method is called after component is rendered.
	 * If you override this method, ensure to call base method to allow Compo be appropriate
	 * initialized (event bindings etc.)
	 */
	renderEnd: function(elements, model, cntx, container){
		// manipulate with elements, events object and compos object
		
		this.base_renderEnd(arguments); 
		//or this.base_renderEnd(elements, model, cntx, container);

		// this.$ is already ready to use
		// this.compos are ready
		// this.events already bound
	},

	$: //[after render] This is jquery/zepto/etc. object holding the elements that belong to this controller

	/**
	 * (optional)
	 * use this function as constructor for custom component, @default is empty function
	 */
	constructor: function(){

	},

	// ... you can define some other function, assume this is a prototype object

	// signal/slot

	/**
	 * Disable/Enable Slot - if is disabled, it will be not fired on dom events, and if no active slots are available for a signal, then 
	 * HTMLElement will be also :disabled
	 */
	slotState: function(slotName, isActive){},

	/**
	 * Disables/Enables the signal completely - all slots in all controllers up in the tree will be enabled/disabled as all HTMLElements with that signal
	 */
	signalState: function(signalName, isActive){},

	/**
	 * Sends signal to itself and then DOWN in the controllers tree
	 */
	emitIn: function(signalName, event, args /* Array */) {},
	
	/**
	 * Sends signal to itself and then UP in the controllers tree
	 */
	emitOut: function(signalName, event, args /* Array */) {},
}));
````

####Signals / Slots 
a signal will be emitted to all controllers up in the controllers tree, starting from a controller, which owns "currentTarget" Element.

````css
div x-signal='click: notify; mousemove: mouseMoved'
````
````javascript
mask.registerHandler(':any', Class({
	name: 'Any',
	slots: {
		notify: function(event){
			// this - reference to current ':any' handler instance
			console.log('panel is clicked, my name is', this.name);

			// to stop signal propagating
			return false;
		}
	}
})
````