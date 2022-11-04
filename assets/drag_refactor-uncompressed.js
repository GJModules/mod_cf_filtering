/*
---

script: Drag.js

name: Drag

description: The base Drag Class. Can be used to drag and resize Elements using mouse events.

license: MIT-style license

authors:
  - Valerio Proietti
  - Tom Occhinno
  - Jan Kassens

requires:
  - Core/Events
  - Core/Options
  - Core/Element.Event
  - Core/Element.Style
  - Core/Element.Dimensions
  - /MooTools.More

provides: [Drag]
...

*/

var Drag = new Class({

    Implements: [Events, Options],

    options: {/*
		onBeforeStart: function(thisElement){},
		onStart: function(thisElement, event){},
		onSnap: function(thisElement){},
		onDrag: function(thisElement, event){},
		onCancel: function(thisElement){},
		onComplete: function(thisElement, event){},*/
        snap: 6,
        unit: 'px',
        grid: false,
        style: true,
        limit: false,
        handle: false,
        invert: false,
        preventDefault: false,
        stopPropagation: false,
        modifiers: {x: 'left', y: 'top'}
    },

    initialize: function(){
        var params = Array.link(arguments, {
            'options': Type.isObject,
            'element': function(obj){
                return obj != null;
            }
        });

        this.element = document.id(params.element);
        this.document = this.element.getDocument();
        this.setOptions(params.options || {});
        var htype = typeOf(this.options.handle);
        this.handles = ((htype == 'array' || htype == 'collection') ? $$(this.options.handle) : document.id(this.options.handle)) || this.element;
        this.mouse = {'now': {}, 'pos': {}};
        this.value = {'start': {}, 'now': {}};

        this.selection = (Browser.ie) ? 'selectstart' : 'mousedown';


        if (Browser.ie && !Drag.ondragstartFixed){
            document.ondragstart = Function.from(false);
            Drag.ondragstartFixed = true;
        }

        this.bound = {
            start: this.start.bind(this),
            check: this.check.bind(this),
            drag: this.drag.bind(this),
            stop: this.stop.bind(this),
            cancel: this.cancel.bind(this),
            eventStop: Function.from(false)
        };
        this.attach();
    },

    attach: function(){
        this.handles.addEvent('mousedown', this.bound.start);
        return this;
    },

    detach: function(){
        this.handles.removeEvent('mousedown', this.bound.start);
        return this;
    },

    start: function(event){
        var options = this.options;

        if (event.rightClick) return;

        if (options.preventDefault) event.preventDefault();
        if (options.stopPropagation) event.stopPropagation();
        this.mouse.start = event.page;

        this.fireEvent('beforeStart', this.element);

        var limit = options.limit;
        this.limit = {x: [], y: []};

        var z, coordinates;
        for (z in options.modifiers){
            if (!options.modifiers[z]) continue;

            var style = this.element.getStyle(options.modifiers[z]);

            // Some browsers (IE and Opera) don't always return pixels.
            if (style && !style.match(/px$/)){
                if (!coordinates) coordinates = this.element.getCoordinates(this.element.getOffsetParent());
                style = coordinates[options.modifiers[z]];
            }

            if (options.style) this.value.now[z] = (style || 0).toInt();
            else this.value.now[z] = this.element[options.modifiers[z]];

            if (options.invert) this.value.now[z] *= -1;

            this.mouse.pos[z] = event.page[z] - this.value.now[z];

            if (limit && limit[z]){
                var i = 2;
                while (i--){
                    var limitZI = limit[z][i];
                    if (limitZI || limitZI === 0) this.limit[z][i] = (typeof limitZI == 'function') ? limitZI() : limitZI;
                }
            }
        }

        if (typeOf(this.options.grid) == 'number') this.options.grid = {
            x: this.options.grid,
            y: this.options.grid
        };

        var events = {
            mousemove: this.bound.check,
            mouseup: this.bound.cancel
        };
        events[this.selection] = this.bound.eventStop;
        this.document.addEvents(events);
    },

    check: function(event){
        if (this.options.preventDefault) event.preventDefault();
        var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
        if (distance > this.options.snap){
            this.cancel();
            this.document.addEvents({
                mousemove: this.bound.drag,
                mouseup: this.bound.stop
            });
            this.fireEvent('start', [this.element, event]).fireEvent('snap', this.element);
        }
    },

    drag: function(event){
        var options = this.options;

        if (options.preventDefault) event.preventDefault();
        this.mouse.now = event.page;

        for (var z in options.modifiers){
            if (!options.modifiers[z]) continue;
            this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];

            if (options.invert) this.value.now[z] *= -1;

            if (options.limit && this.limit[z]){
                if ((this.limit[z][1] || this.limit[z][1] === 0) && (this.value.now[z] > this.limit[z][1])){
                    this.value.now[z] = this.limit[z][1];
                } else if ((this.limit[z][0] || this.limit[z][0] === 0) && (this.value.now[z] < this.limit[z][0])){
                    this.value.now[z] = this.limit[z][0];
                }
            }

            if (options.grid[z]) this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % options.grid[z]);

            if (options.style) this.element.setStyle(options.modifiers[z], this.value.now[z] + options.unit);
            else this.element[options.modifiers[z]] = this.value.now[z];
        }

        this.fireEvent('drag', [this.element, event]);
    },

    cancel: function(event){
        this.document.removeEvents({
            mousemove: this.bound.check,
            mouseup: this.bound.cancel
        });
        if (event){
            this.document.removeEvent(this.selection, this.bound.eventStop);
            this.fireEvent('cancel', this.element);
        }
    },

    stop: function(event){
        var events = {
            mousemove: this.bound.drag,
            mouseup: this.bound.stop
        };
        events[this.selection] = this.bound.eventStop;
        this.document.removeEvents(events);
        if (event) this.fireEvent('complete', [this.element, event]);
    }

});

/*
---

script: Class.Refactor.js

name: Class.Refactor

description: Extends a class onto itself with new property, preserving any items attached to the class's namespace.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Class
  - /MooTools.More

# Some modules declare themselves dependent on Class.Refactor
provides: [Class.refactor, Class.Refactor]

...
*/

Class.refactor = function(original, refactors){

    Object.each(refactors, function(item, name){
        var origin = original.prototype[name];
        origin = (origin && origin.$origin) || origin || function(){};
        original.implement(name, (typeof item == 'function') ? function(){
            var old = this.previous;
            this.previous = origin;
            var value = item.apply(this, arguments);
            this.previous = old;
            return value;
        } : item);
    });

    return original;

};


/*credits: http://stackoverflow.com/questions/7588576/drag-with-mootools-on-mobile */

Class.refactor(Drag,
    {
        attach: function(){
            this.handles.addEvent('touchstart', this.bound.start);
            this.handles.addEvent('keydown', this.bound.start);
            return this.previous.apply(this, arguments);
        },

        detach: function(){
            this.handles.removeEvent('touchstart', this.bound.start);
            this.handles.removeEvent('keydown', this.bound.start);
            return this.previous.apply(this, arguments);
        },

        start: function(event){
            //this.previous.apply(this, arguments);

            //redeclare the this.mouse.start, based on the keyboard events
            this.mouse.start = typeof event.page.x != 'undefined' ? event.page : null;

            // the keyboard events do not support the event.page
            if(this.mouse.start === null) {
                let coordinates = this.element.getCoordinates();
                this.mouse.start = {x:coordinates.left, y:coordinates.top}
            }

            var limit = this.options.limit;
            this.limit = {x: [], y: []};

            var z, coordinates;
            for (z in this.options.modifiers){
                if (!this.options.modifiers[z]) continue;

                var style = this.element.getStyle(this.options.modifiers[z]);

                // Some browsers (IE and Opera) don't always return pixels.
                if (style && !style.match(/px$/)){
                    if (!coordinates) coordinates = this.element.getCoordinates(this.element.getOffsetParent());
                    style = coordinates[this.options.modifiers[z]];
                }

                if (this.options.style) this.value.now[z] = (style || 0).toInt();
                else this.value.now[z] = this.element[this.options.modifiers[z]];

                if (this.options.invert) this.value.now[z] *= -1;

                this.mouse.pos[z] = this.mouse.start[z] - this.value.now[z];

                if (limit && limit[z]){
                    var i = 2;
                    while (i--){
                        var limitZI = limit[z][i];
                        if (limitZI || limitZI === 0) this.limit[z][i] = (typeof limitZI == 'function') ? limitZI() : limitZI;
                    }
                }
            }

            if (typeOf(this.options.grid) == 'number') this.options.grid = {
                x: this.options.grid,
                y: this.options.grid
            };

            /*
             Add event listeners based on the type of the start event
             We do not want to trigger the mouse move event when we use keyboard
             */
            if(event.type == 'touchstart') {
                document.body.addEvents({
                    touchmove: this.bound.check,
                    touchend: this.bound.cancel
                });
            }

            if(event.type == 'mousedown') {
                document.addEvents({
                    mousemove: this.bound.check,
                    mouseup: this.bound.cancel
                });
            }

            if(event.type == 'keydown' && event.key == 'left' || event.key == 'right') {
                document.getElements('.cf_filtering_slide_container').addEvents({
                    keydown: this.bound.check,
                    keyup: this.bound.cancel
                });
            }
        },

        check: function(event){

            if (this.options.preventDefault) {
                event.preventDefault();
            }

            let positionX = event.type == 'mousmove' ? event.page.x : (event.key != 'right' ? this.mouse.start.x -3: this.mouse.start.x +3);
            let distance = Math.round(Math.sqrt(Math.pow(positionX - this.mouse.start.x, 2)));

            if (distance >= this.options.snap){

                this.cancel();

                if(event.type == 'keydown') {

                    document.addEvents({
                        keydown: this.bound.drag,
                        keyup: this.bound.stop
                    });
                }
                else {
                    document.body.addEvents({
                        touchmove: this.bound.drag,
                        touchend: this.bound.stop,
                        mousemove: this.bound.drag,
                        mouseup: this.bound.stop
                    });
                }
            }
        },
        drag: function(event){
            var options = this.options;

            if (options.preventDefault) event.preventDefault();
            //redeclare the this.mouse.start, based on the keyboard events
            this.mouse.now = typeof event.page.x != 'undefined' ? event.page : null;

            // the keyboard events do not support the event.page
            if(this.mouse.now === null) {
                let coordinates = this.element.getCoordinates();
                coordinates.left = event.key != 'right' ? coordinates.left -3: coordinates.left +3;
                this.mouse.now = {x:coordinates.left, y:coordinates.top}
            }

            for (var z in options.modifiers){
                if (!options.modifiers[z]) continue;
                this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];


                if (options.invert) this.value.now[z] *= -1;

                if (options.limit && this.limit[z]){
                    if ((this.limit[z][1] || this.limit[z][1] === 0) && (this.value.now[z] > this.limit[z][1])){
                        this.value.now[z] = this.limit[z][1];
                    } else if ((this.limit[z][0] || this.limit[z][0] === 0) && (this.value.now[z] < this.limit[z][0])){
                        this.value.now[z] = this.limit[z][0];
                    }
                }

                if (options.grid[z]) this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % options.grid[z]);

                if (options.style) this.element.setStyle(options.modifiers[z], this.value.now[z] + options.unit);
                else this.element[options.modifiers[z]] = this.value.now[z];
            }

            this.fireEvent('drag', [this.element, event]);
        },

        cancel: function(event){
            document.body.removeEvents({
                touchmove: this.bound.check,
                touchend: this.bound.cancel
            });
            document.getElements('.cf_filtering_slide_container').removeEvents({
                keydown: this.bound.check,
                keyup: this.bound.cancel
            });
            return this.previous.apply(this, arguments);
        },

        stop: function(event){
            document.body.removeEvents({
                touchmove: this.bound.drag,
                touchend: this.bound.stop,
                mousemove: this.bound.drag,
                mouseup: this.bound.stop,
            });

            document.removeEvents({
                keydown: this.bound.drag,
                keyup: this.bound.stop
            });
            return this.previous.apply(this, arguments);
        }
    });
