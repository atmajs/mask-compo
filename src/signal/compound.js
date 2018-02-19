var _compound;
(function(){

	_compound = function (ctr, slotExpression, cb) {
        var slots = ctr.slots;
        if (slots == null) {
            slots = ctr.slots = {};
        }
        var worker = new SlotExpression(slotExpression, cb);
        for (var i = 0; i < worker.slots.length; i++) {
            var name = worker.slots[i].name;
            Compo.attach(ctr, 'slots.' + name, worker.signalDelegate(name));
        }  
        return worker;     
    };
    
    var SlotExpression = class_create({
        slots: null,
        flags: null,
        cb: null,
        expression: null,
        constructor: function (expression, cb) {
            var str = expression.replace(/\s+/g, '');
            var refs = expression_varRefs(str);
            this.cb = cb;
            this.slots = [];
            this.flags = {};
            this.expression = str;
            for (var i = 0; i < refs.length; i++) {
                var name = refs[i];
                this.flags[name] = 0;
                this.slots[i] = {
                    name: name,
                    action: str[str.indexOf(name) - 1],
                    index: i
                };
            }
        },
        signalDelegate: function (name) {
            var self = this;
            return function () {
                self.call(name);
            };
        },
        call: function (name) {
            var slot = this.findSlot(name);
            if (slot.action !== '^') {
                this.flags[name] = 1;
                var state = expression_eval(this.expression, this.flags);
                if (state) {
                    this.cb();
                }
                return;
            }
            var prev = slot;
            do {
                prev = this.slots[prev.index - 1];
            } while(prev != null && prev.action === '^');
            if (prev) {
                this.flags[prev.name] = 0;
            }
        },
        findSlot: function (name) {
            for (var i = 0; i < this.slots.length; i++) {
                var slot = this.slots[i];
                if (slot.name === name) {
                    return slot;
                }
            }
            return null;
        }
    });
    
    var rgx = /(\-+)\s*([\w\d_]+)/g;

}());