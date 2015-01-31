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

> `click` and `mouse*` events are also mapped to corresponding `touch*` events, when also touch input is supported.

#### Api
- [Inheritance](#inheritance)
- [Component Definition](#componentsproto)
	- [constructor](#proto-constructor)
	- [tagName](#tagname)
	- [template](#template)
	- [slots](#slots)
	- [pipes](#pipes)
	- [events](#events)
	- [compos](#compos)
	- [attr](#attr)
	- [onRenderStart](#onrenderstart)
	- [onRenderEnd](#onrenderend)
	- [render](#render)
	- [dispose](#dispose)
	- [meta](#meta)
		- [attributes](#meta-attributes)
		- [template](#meta-template)
		- [mode](#meta-mode)
		
- [Instance](#instance)
	- [$](#prop-domlib)
	- [find](#prop-find)
	- [closest](#prop-closest)
	- [remove](#prop-remove)
	- [slotState](#prop-slotstate)
	- [signalState](#prop-signalstate)
	- [emitIn](#prop-emitin)
	- [emitOut](#prop-emitout)
- [Static](#static)
	- [config](#static-config)
		- [setDOMLibrary](#static-config-setdomlibrary)
	- [pipe](#static-pipe)
		- [emit](#static-pipe-emit)

##### Create a component
`mask.Compo(ComponentProto: Object):Function`

> Returns the components constructor. You would want to add it to masks repo:
```javascript
mask.registerHandler('someTagName', mask.Compo(ComponentProto));
```

#### Inheritance
`mask.Compo(...base:String|Object|Function, ComponentProto)`
- `String`: Name of the component. The component must be registered with `mask.registerHandler`
- `Object`: Any object. _Note:_ **deep** property extending is used.
- `Function`: _Note:_ constructor is also inherited and will be automatically invoked. Also `prototype` data is inherited.

> `onRenderStart`, `onRenderEnd`, slots and pipes are called automatically one after
> another starting from the first inherited component.
> All other functions will have `super` function.
```javascript
var A = mask.Compo({
	slots: {
		doSmth: function(){
			console.log('slot-a');
		}
	},
	foo: function(){
		console.log('fn-foo-a');
	}
})
var B = mask.Compo(A, {
	slots: {
		doSmth: function(){
			console.log('b');
		}
	},
	foo: function(){
		console.log('fn-foo-b');
		this.super();
	}
})
```

#### ComponentsProto

> All properties are optional, any amount of custom properties and functions are allowed.

- **`constructor : Function`** <a name='proto-constructor'>#</a>

- **`tagName : String`** <a name='tagname'>#</a>

	_(optional)_ Component renders its template only, but when `tagName` is defined, then it will also creates appropriete _wrapper_ element, and renders the template _(if any)_ into the element.
	
	```javascript
		mask.registerHandler(':foo', mask.Compo({
			tagName: 'section',
			template: 'span > "Hello"',
			onRenderEnd: function(){
				this.$.get(0).outerHTML === '<section><span>Hello</span></section>'
			}
		})
	```

- **`template : String`** <a name='template'>#</a>
	
	There are **many** ways to define the template for a component:
	
	- in-line the template of the component directly into the parents template
	
		```sass
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
	- via the `template` property. This approach is much better, as it leads to the separation of concerns. Each component loads and defines its own templates. Direct **inline** template was shown in the `tagName` sample, but to write some the templates in javascript files is not always a good idea. Better to preload the template with `IncludeJS` for example. **Note:** The Application can be built for production. All the templates are then embedded into single `html` file. Style and Javascript files are also combined into single files.
	
		```sass
		// myComponent.mask
		span > 'My Component'
		/*..*/
		```
		```javascript
		// Example: Load the template and the styles with `IncludeJS`
		include
			.css('./myComponent.less')
			.load('./myComponent.mask')
			.done(function(resp){
				mask.registerHandler(':myComponent', mask.Compo({
					template: resp.load.myComponent
				});
			})
		```
		So now, the component is a standalone unit, which can be easily tested, separately developed, embedded(_defined in the templates_) anywhere else in the project, or moved to the next project. Just load the controller: `include.js('/scripts/myComponent/myComponent.js')` and the component is ready to use.

	- more deeper way is setting the parsed template directly to `nodes` property:
	
		```javascript
		...
		onRenderStart: function(){
			this.nodes = mask.parse('h4 > "Hello"');
		}
		```
	
	- via the `:template` component
	
		```sass
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
	
- **`slots : Object`** <a name='slots'>#</a>
	
	Defines list of `slots`, which are called, when the signal is emitted and riches the controllers `slotName:Function`.
	_slotName ~ signalName are equivalent_
	
	Signal can be sent in several ways:
	
	- from the template itself, when `x-signal` attribute is defined for the element:
	
		```sass
		div x-signal='eventName: signalName; otherEventName: otherSignalName;';
		
		// attribute aliases:
		x-click, x-tap, x-taphold, x-keypress, x-keydown, x-keyup, x-mousedown, x-mouseup
		```
	- from any parent controller:
	
		```javascript
		this.emitIn('signalName', arg1, arg2);
		```
	- from any child controller:
	
		```javascript
		this.emitOut('signalName', arg1, arg2);
		```
		
	**Slot Handler**. _Can terminate the signal, or override the arguments._
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
	**Predefined signals**
	- `domInsert` - is sent to all components, when they are inserted into the **live** DOM
	
		```javascript
			slots: {
				domInsert: function(){
					this.$.innerWidth() // is already calculable
				}
			}
		```
- **`pipes : Object`** <a name='pipes'>#</a>

	Generic `signal-slots` signals  traverse the controllers tree upwards and downwards. `Pipped` signals are used to  join(_couple_) two or more controllers via `pipes`. Now anyone can emit a signal in a pipe, and that signal will traverse the pipe *always* starting with the last child in a pipe and goes up to the first child. _Pipe is a one dimensional array of the components bound to the pipe_. Signal bindings are also declarative, and are defined in ```pipes``` Object of a Compo definition.
	```javascript
	mask.registerHandler(':any', Compo({
		logoutUser: function(){
			Compo.pipe('user').emit('logout');
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

- **`events : Object`** <a name='events'>#</a>

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
	
- **`compos : Object`** <a name='compos'>#</a>

	Defines list of Component, jQuery or DOM Element object, which should be queried when the component is rendered.
	
	> It is also possible to find needed nodes later with `this.$.find('domSelector')` or `this.find(componentSelect)`. But with `compos` object there is always the overview off all dom referenced nodes, and the performance is also better, as the nodes are queried once.
	
	For better debugging warning message is raised, when it fails to match the elements.
	
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

- **`attr : Object`** <a name='attr'>#</a>

	Add additional attributes to the component. This object will also store the attributes defined from the template.
	```sass
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
- **`onRenderStart : function(model, ctx, container:DOMElement): void | Deferred`** <a name='onrenderstart'>#</a>

	Is called before the component is rendered. In this function for example `this.nodes` and `this.model` can be overridden. Sometimes you have to fetch model data before proceeding, and from here this component rendering can be paused:
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
	> **Note** Only this component is paused, if there are more async components, then awaiting and rendering occurs parallel
	
- **`render : function(model, ctx, container)`** <a name='render'>#</a>

	_(rare used. Usually for some exotic rendering)._ When this function is defined, then the component should render itself and all children on its own, and the `onRenderStart` and `onRenderEnd` are not called.

- **`onRenderEnd : function(elements:Array<DOMElement>, model, ctx, container)`** <a name='onrenderend'>#</a>

	Is called after the component and all children are rendered.
	`this.$`, the DomLibrary(_jQuery, Zepto_) wrapper over the elements is now accessible.
	
	> **Note** DOMElements are created in the `DocumentFragment`, and not the live dom. Refer to `domInsert` if you need, for example, to calculate the elements dimensions.

- **`dispose : function()`** <a name='dispose'>#</a>

	Is called when the component is removed.

- **`meta : Object`** <a name='meta'>#</a>

	Stores some additional information for the component: for some validations and transforms
	
	- **`attributes`** <a name='meta-attributes'>#</a>
	
		There is a convention for the custom attributes: `x-attribute-name`. Attributes, which are declared here, are then bound directly to the instance in `camelCase` manner. When some attribute values are not valid, the component is not rendered, and instead the error message is rendered.
		```javascript
		// :foo x-foo='5' x-quux='some value';
		
		mask.registerHandler(':foo', mask.Compo({
			meta: {
				attributes: {
					// required custom attribute, value is parsed to number
					'x-foo': 'number',
					// optional custom attribute, value is parsed to boolean
					'?x-baz': 'boolean',
					
					// required
					'x-quux': function(value){
						// perform some custom check
						if (check(value) === false)
							return Error('Attributes value is not valid');
							
						// optionally perform some object transformations/parsing
						return transform(value);
					}
				}
			},
			onRenderStart: function(){
				this.xFoo === 5
				this.xQuux 
			}
		}));
		```

	- **`template`** <a name='meta-template'>#</a>

		Defines how `template` property defined via the component declaration and the `nodes` property defined in
		inlined mask template behavious towards each other.
		
		- `'replace'` - (_default_) Child nodes from the inlined mask markup (_if any_) will replace the `template` property
		
			```javascript
				mask.registerHandler(':foo', mask.Compo({
					template: 'h4 > "Hello"'
				});
				mask.render(':foo')
					// `h4 > "Hello"` template is rendered
				
				mask.render(':foo > h1 > "World"')
					// `h1 > "World"` template is rendered
			```
			
		- `'merge'` - `template` and `nodes` will be merged using merge syntax
		
			```javascript
				// very basic sample, usually it would be much greater encapsulation
				mask.registerHandler(':foo', mask.Compo({
					meta: {
						template: 'merge'
					},
					template: 'h4 > @title;'
				});
				mask.render(':foo > @title > "Foo"')
					// `h4 > "Foo"` template is rendered
			```
		- `'join'` - `template` and `nodes` will be concatenated
		
		@see tests [/test/meta/template.test](/test/meta/template.test) for more examples

	- **`mode`** <a name='meta-mode'>#</a>
	
		Render Mode. _Relevant only to the NodeJS._
		- `client`: Component is not rendered on the backend, but will be serialized and the rendered on the client
		- `server`: Component is rendered on the backend, and will not be bootstrapped on the client
		- `both`  : (_default_) Component is rendered on the backend, and will be bootstrapped(initialized) on the client
	
	
#### Instance

- **`Instance::$`** <a name='prop-domlib'>#</a>
	
	DOM Library wrapper of the elements (jQuery/Zepto/Kimbo).

- **`Instance::find(selector:String)`** <a name='prop-find'>#</a>
	
	Find the child component. Selector:
	```javascript
	// compo name
	this.find(':spinner')
	// id
	this.find('#mySpinner');
	// class
	this.find('.mySpinner');
	```
	
- **`Instance::closest(selector:String)`** <a name='prop-closest'>#</a>

	Find the first parent matched by selector. 

- **`Instance::remove()`** <a name='prop-remove'>#</a>
	
	Removes elements from the DOM and calls `dispose` function on itself and all children

- **`Instance::slotState(slotName, isActive)`** <a name='prop-slotstate'>#</a>
	
	Disable/Enable single slot signal - if is disabled, it will be not fired. And if no more active slots are available for a signal, then all HTMLElements with this signal get `disabled` property set to `true`

- **`Instance::signalState(signalName, isActive)`** <a name='prop-signalstate'>#</a>
	
	Disables/Enables the signal - **all slots** in all controllers up in the tree will be also `enabled/disabled`
	```javascript
	// :foo > button x-signal='click: performAction'
	mask.registerHandler(':foo', mask.Compo({
		slots: {
			performAction: function(){
				this.signalState('performAction', false);
				// disable signal, so even when it is sent one more time, it wont be called
				// (button is also disabled as no more slots available for the signal)
				
				// fake some async job, and once again enable the signal
				setTimeout(() => this.signalState('performAction', true), 200);
			}
		}
	})
	```

- **`Instance::emitIn(signalName [, ...arguments])`** <a name='prop-emitin'>#</a>
	
	Send signal to itself and then **DOWN** in the controllers tree

- **`Instance::emitOut(signalName [, ...arguments])`** <a name='prop-emitout'>#</a>
	
	Send signal to itself and then **UP** in the controllers tree


#### Static

- **`Compo.config:Object`** <a name='static-config'>#</a>

	Contains configuration functions
	
	- **`Compo.config.setDOMLibrary($:Object)`** <a name='static-config-setdomlibrary'>#</a>
	
		`DOM Library` is a library, which makes it easer to manipulate the DOM. When the `CompoJS` is loaded, it will try to pick up from globals some of this dom libraries: [JQuery](http://jquery.com), [Zepto](http://zeptojs.com/) or [Kimbo](http://kimbojs.com/). Each time the component is rendered, it will wrap its DOM child nodes using the DOM library and you can access it under `$` property: e.g. `this.$`
	
- **`Compo.pipe(name:String):Pipe`** <a name='static-pipe'>#</a>

	Get the Pipe.
	
	- **`Pipe::emit(signal:String [, ...args])`** <a name='static-pipe-emit'>#</a>
	
		Emits the signal in a pipe. 
		
		```javascript
		mask.registerHandler(':some', Compo({
			pipes: {
				'foo': {
					// registers `bazSignal` signal in a `foo` pipe.
					bazSignal: function(...args){}
				}
			}
		}));
		Compo.pipe('foo').emit('bazSignal', 'Hello');
		```
		

----
:copyright: The Atma.js Project - 2015 - MIT