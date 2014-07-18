Mask Component Library
----

[![Build Status](https://travis-ci.org/atmajs/mask-compo.svg?branch=master)](https://travis-ci.org/atmajs/mask-compo)

#### Getting started

```html
<!DOCTYPE html>
<body>
	<script type='text/mask' data-run='true'>
		// mask template
		customPanel {
			input #name placeholder='Enter name' > :dualbind value='name';
			button x-signal='click: sendData' > 'Submit'
		}
	</script>
	<script>
		// Sample component controller. Refer to `API` for full documentation
		mask.registerHandler('customPanel', mask.Compo({
			slots: {
				sendData: function(event){
					// `this` references the current `customPanel` instance
					// handle click
				}
			},
			events: {
				// e.g. bind event
				'change: input#name' : function(event){
					this.$ // (domLib wrapper over the component elements)
				}
			},
			onRenderStart: function(){
				this.model = { name: 'Baz' };
			}
		}));
		mask.run();
	</script>
</body>
```

#### Api

##### Constructor
`mask.Compo(ComponentProto: Object)`
###### ComponentsProto

> All properties are optional, any amount of custom properties and functions are allowed.

- **`tagName:String`**
	_(Optionally)_ Component renders its template only, but when `tagName` is defined, then it will also creates appropriete _wrapper_ element, and renders the template _(if any)_ into the element.
	
	```javascript
		mask.registerHandler(':foo', mask.Compo({
			tagName: 'section',
			template: 'span > "Hello"',
			onRenderEnd: function(){
				this.$.get(0).outerHTML === '<section><span>Hello</span></section>'
			}
		})
	```

- **`template:String`** [#](#template)
	
	There are **many** ways to define a template for a component:
	
	- via the parent mask template
	
		```scss
		h4 > 'Hello'
		:myComponent {
			// here goes components template
			span > 'My Component'
			ul {
				li > 'A'
				li > 'B'
			}
		}
		```
	- via the `template` property. This approach is much better, as it leads to the separation of concerns. Each component loads and defines its own templates. Direct **inline** template was schown in the `tagName` sample, but writing some bigger template in javascript files is not the good idea. Better preload the template with `IncludeJS` for example. **Note:** The Application can be built for production. All the templates are then embedded into single `html` file. Style and Javascript files are also combined into single files.
	
		```scss
		// myComponent.mask
		span > 'My Component'
		/*..*/
		```
		```javascript
		// Example: Load the template and the styles with `IncludeJS`
		include
			.css('./myComponent.less')
			.load('./myComponent.mask)
			.done(function(resp){
				mask.registerHandler(':myComponent', mask.Compo({
					template: resp.load.myComponent
				});
			})
		```
		So now, the component is a standalone unit, which can be easily tested, seperatly developed and moved to the next project, just load the controller: `include.js('/scripts/myComponent/myComponent.js')`

	- more deeper way is setting the parsed template directly to `nodes` property:
	
		```javascript
		...
		onRenderStart: function(){
			this.nodes = mask.parse('h4 > "Hello"');
		}
		```
	
	- via the `:template` component
	
		```scss
		// somewhere before
		:template #myComponentTmpl {
			h4 > "Hello"
		}
		// ... later
		:myComponent {
			:import #myComponentTmpl;
		}
		```
	- via external the `script type=text/mask` node.
	
		```html
		<script type='text/mask' id='#myComponentTmpl'>
			h4 > "Hello"
		</script>
		<script>
			mask.registerHandler(':myComponent', mask.Compo({
				template: '#myComponent'
			});
		</script>
		```
		
	> You see, there are too many ways to define the template. It is up to you to decide which one is the most appropriate in some particular situation. We prefer to store the templates for each component in external files, as from example with `IncludeJS`.
	
- **`slots:Object`** [#](#slots)
	
	Defines list of `slots`, which are called, when the signal is emitted and riched the controller `slotName:Function`.
	_slotName ~ signalName are equivalent_
	Signal can be sent in several ways:
	
	- from the template itself, when `x-signal` attribute is defined for the element:
	
		```scss
		div x-signal='eventName: signalName; otherEventName: otherSignalName;';
		```
	- from any parent controller:
	
		```javascript
		this.emitIn('signalName', arg1, arg2);
		```
	- from any child controller:
	
		```javascript
		this.emitOut('signalName', arg1, arg2);
		```
		
	**Slot Handler**. _Can terminate signal, or change arguments._
	```javascript
	slots: {
		/*
		 * - sender:
		 *    1) Controller which sent the signal
		 *    2) When called from the template `sender` is the `event` Object
		\*/
		fooSlot: function(sender[, ...args]){
			// terminate signal
			return false;
			
			// override arguments
			return [otherArg, otherArg2];
		}
	}
	```
	** Predefined signals **
	- `domInsert` - is sent to all components, when they are inserted into the **live** DOM
	
		```javascript
			slots: {
				domInsert: function(){
					this.$.innerWidth() // is already calculatable
				}
			}
		```
- **`pipes:Object`** [#](#pipes)

	As generic slot-signals traverse the controllers tree upwards and downwards,
	so to join two controllers that are not with signal/slot richable, you can use signals in a pipe. Controllers will be joined with a pipe,
	and the signal will traversed in that pipe *always* starting with the last child in a pipe and goes up to the first child. Pipe is a one dimensional array,
	in compare to generic controllers tree. Signal bindings are also declarative, and are defined in ```pipes``` Object of a Compo defenition.
	```javascript
	mask.registerHandler(':any', Compo({
		slots: {
			logout: function(){
				Compo.pipe('user').emit('logout');
			}
		}
	}));
	
	
	mask.registerHandler(':footerUserInfo', Compo({
		pipes: {
			// pipe name
			user: {
				logout: function(){
					this.$.hide();
				}
				// ...
				// other pipe signals
			}
		}
	}));
	```
	
	Piped signals could be also triggered on dom events, such as normal signals.
	```css
	button x-pipe-signal='click: user.logout' > 'Logout'
	```

- **`events: Object`** [#](#events)

	Defines list of delegated events captured by the component
	```javascript
	events: {
		'eventName: delegated_Selector': function(event){
			// this === component instance
		},
		// e.g
		'click: button.hideComponent': function(){
			this.$.fadeOut();
		}
	}
	```
	
- **`compos`** [#](#compos)

	Defines list of Component, jQuery or DOM Element object, which should be queried when the component is rendered.
	
	> It is also possible to find needed nodes later with `this.$.find('domSelector')` or `this.find(componentSelect)`. But with `compos` object there is always the overview off all dom referenced nodes, and the performance is also better, as the nodes are queried once.
	
	For better debugging warning message is rised, when it fails to match the elements.
	
	**Syntax**: ` 'compoName': 'selectorEngine: selector', `. Selector Engine:
	
	- `$` : query the dom nodes with `jQuery | Zepto`.
	- `compo`: query the components dom to match a component
	- ``: _none_ means to use native `querySelector`.
	
	Example:
	```javascript
	mask.registerHandler(':foo', mask.Compo({
		template: 'input type=text; span.msg; :spinnerCompo;',
		compos: {
			input: '$: input',
			spinner: 'compo: :spinnerCompo',
			messageEl: '.msg'
		},
		
		someFunction: function(){
			// samples
			this.compos.input.val('Lorem ipsum');
			this.compos.spinner.start();
			this.compos.messageEl.textContent = '`someFunction` was called';
		}
	}))
	```

- **`attr:Object`** [#](#attributes)

	Add additional attributes to the component. This object will also store the attributes defined from the template.
	```scss
	:foo name='fooName';
	```
	```javascript
	mask.registerHandler(':foo', mask.Compo({
		tagName: 'input',
		attr: {
			id: 'MyID'
		},
		someFunction: function(){
			this.attr.name === 'fooName';
			this.attr.id === 'MyID'
		}
	}));
	// result: <input name='fooName' id='MyID' />
	```
- **`onRenderStart:function(model, ctx, container:DOMElement): void | Deferred`** [#](#onrenderstart)

	Is called before the component is rendered. In this function for example `this.nodes` and `this.model` can be overriden. Sometimes you have to fetch model data before proceeding, and from here this component rendering can be paused:
	```javascript
	onRenderStart: function(model, ctx, container){
		var resume = Compo.pause(this, ctx);
		$.getJSON('/users').done(array => {
			this.model = array;
			resume();
		});
		// or just return defer object
		return $
			.getJSON('/users')
			.done(array => this.model = array);
	}
	```
	> **Note** Only this component is paused, if there are more async components, then awaiting and rendering occures parallel
	
- **`render: function(model, ctx, container)`**

	_(rare used. Usually for some exotic rendering)._ When this function is defined, then the component should render itself and all children on its own, and the `onRenderStart` and `onRenderEnd` are not called.

- **`onRenderEnd: function(elements:Array<DOMElement>, model, ctx, container)`**

	Is called after the component and all children are rendered.
	`this.$`, the DomLibrary(_jQuery, Zepto_) wrapper over the elements is now accessable.
	
	> **Note** DOMElements are created in the `DocumentFragment`, and not the live dom. Refer to `domInsert` if you need, for example, to calculate the elements dimensions.


#### `Instance::slotState(slotName, isActive)`
Disable/Enable single slot - if is disabled, it will be not fired on dom events, and if no active slots are available for a signal, then all HTMLElements with this signal get `disabled` property set to `true`

#### `Instance::signalState(signalName, isActive)`
Disables/Enables the signal - **all slots** in all controllers up in the tree will be also `enabled/disabled`

#### `Instance::emitIn(signalName [, ...arguments])`
Sends signal to itself and then DOWN in the controllers tree

#### `Instance::emitOut(signalName [, ...arguments])`
Sends signal to itself and then UP in the controllers tree



----
(c) 2014 MIT