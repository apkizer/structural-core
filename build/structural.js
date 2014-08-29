/* Structural, by Alex Kizer */


window.S = (function ($) {
    "use strict";
    var S = {};
    console.info('Initializing structural-core');
    S.components = {};
    S.views = {};

    var components = {},
        componentMethods = {},
        standaloneMethods = {},
        componentMeta = {};

    /**
     * Registers a component.
     * @param name The name of the component.
     * @param factoryFunction A function which returns new instances of the component.
     * @param noDefault If true, Structural does not provide a default deferred execution context on instances of this component.
     */
    S.defineComponent = function (name, factoryFunction, noDefault) {
        components[name] = factoryFunction;
        /* middleware & default deferred context */
        S.components[name] = function () {
            var component = components[name].apply(this, arguments);
            // provide default deferred context
            if (S.config.provideDefaultDeferredContext && !noDefault) {
                provideDefaultDeferredContext(component);
            }
            // give default view
            if (S.views[name]) {
                console.log('setting view ' + name);
                component.setView(S.views[name]());

            }
            // initialize component
            if (component.init) component.init();
            return component;
        }
    }

    S.defineMethodOn = function (name, methodName, func) {
        if (!componentMethods[name])
            componentMethods[name] = {};
        componentMethods[name][methodName] = func;
    }

    S.defineStandaloneMethod = function (requirements, optionalRequirements, func) {
        if (!standaloneMethods[name])
            standaloneMethods[name] = {};
        standaloneMethods[name].requirements = requirements;
        standaloneMethods[name].optionalRequirements = optionalRequirements;
        standaloneMethods[name][methodName] = func;
    }

    S.setMetaData = function (name, meta) {
        componentMeta[name] = meta;
    }

    function provideDefaultDeferredContext(component) {
        component.def = new S.Deferred(); //S.deferred();
        component.def.wrap(component);
        component.deferredContext = component.def.getContext();
    }

    S.setDefaultView = function (name, factory) {
        S.views[name] = factory;
    }

    /*S.addView = function(component, name, func) {
    if(!S.views[component])
      S.views[component] = {};
    S.views[component][name] = func;
}*/

    S.addMethod = function (componentName, methodName, func) {
        if (!componentMethods[componentName])
            componentMethods[componentName] = {};
        componentMethods[componentName][methodName] = func;
    }

    S.getComponentMethods = function (componentName) {
        return componentMethods[componentName];
    }
    S.config = {
        provideDefaultDeferredContext: true,
        /* Provide a deferred context on newly created components. */
        viewClass: 'structural_view',
        /* CSS class for views */
        specialStrings: {
            nullString: '__null' /* special symbol displayed when array cell or tree node set to this */
        }
    };
    var id = 0;

    S.nextId = function () {
        return 'sid_' + id++;
    }

    S.map = function () {
        var values = {},
            keys = {},
            map = function (key, value) {
                if (!key.sid)
                    throw new Error('S.map() requires sid property. Use S.nextId().');
                if (typeof value === 'undefined') {
                    if (!values[key.sid])
                        values[key.sid] = {};
                    return values[key.sid];
                }
                values[key.sid] = value;
                keys[key.sid] = key;
            };

        map.clear = function () {
            values = {};
            keys = {};
        };

        map.delete = function (key) {
            if (!key.sid)
                throw new Error('S.map() requires sid property. Use S.nextId().');
            delete values[key.sid];
        };

        map.has = function (key) {
            if (!key.sid)
                throw new Error('S.map() requires sid property. Use S.nextId().');
            return typeof values[key.sid] !== 'undefined';
        }

        map.forEach = function (fn, thisArg) {
            if (!thisArg)
                thisArg = {};
            for (var sid in values) {
                fn.call(thisArg, [keys[sid], values[sid]]);
            }
        }

        return map;
    }

    S.wait = function (func, time) {
        setTimeout(func, time);
    }
    S.EventEmitter = (function () {

        function EventEmitter() {
            this.registeredEvents = {};
        }

        EventEmitter.prototype.on = function (eventName, fn) {
            if (!this.registeredEvents[eventName]) //typeof this.registeredEvents[eventName] === 'undefined')
                this.registeredEvents[eventName] = [];
            this.registeredEvents[eventName].push(fn);
        };

        EventEmitter.prototype.fire = function (eventName, event) {
            if (!this.registeredEvents[eventName]) //typeof this.registeredEvents[eventName] === 'undefined')
                return;
            for (var i = 0; i < this.registeredEvents[eventName].length; i++) {
                this.registeredEvents[eventName][i].call(event, event);
            }
        };

        return EventEmitter;

    })();

    S.ee = function () {
        var ee = {};
        ee.registeredEvents = {};

        ee.on = function (eventName, fn) {
            if (typeof ee.registeredEvents[eventName] === 'undefined')
                ee.registeredEvents[eventName] = [];
            ee.registeredEvents[eventName].push(fn);
        };

        ee.fire = function (eventName, event) {
            if (typeof ee.registeredEvents[eventName] === 'undefined')
                return;
            for (var i = 0; i < ee.registeredEvents[eventName].length; i++) {
                ee.registeredEvents[eventName][i].call(event, event);
            }
        };

        return ee;
    }
    S.Component = (function () {

        function Component(name, view, state) {
            console.info('Component being created. name is %s. view is %s. state is %s', name, view, state);
            this.name = name;
            //this.live = {};
            this.state = state;
            if (view)
                this.setView(view);
        }

        Component.prototype = Object.create(S.EventEmitter.prototype);

        Component.prototype.live = {};

        Component.prototype.setView = function (view) {
            this.view = view;
            view.component = this;
            view.init();
        }

        Component.prototype.getState = function () {
            return this.state;
        }

        Component.prototype.copy = function () {
            //
        }

        Component.prototype.serialize = function () {
            //
        }

        Component.prototype.deserialize = function () {
            //
        }

        Component.prototype.getConfigTemplate = function () {

        }

        // wrappable:

        Component.prototype.getSync = function () {
            return this.live;
        }

        Component.prototype.getAsync = function () {
            return this.view.live;
        }

        Component.prototype.getMethods = function () {
            return S.getComponentMethods(this.name);
        }

        return Component;

    })();



    S.View = (function ($) {

        function View() {
            this.live = {};
            this._speed = 0;
            this._config = {};
            this.$element = $('<div></div>').addClass(S.config.viewClass);
        }

        View.prototype = Object.create(S.EventEmitter.prototype);

        View.prototype.init = function () {
            //
        }

        View.prototype.render = function () {
            //
        }

        View.prototype.scaleTo = function (dimensions) {
            this.$element.width(dimensions.width);
            this.$element.height(dimensions.height);
        }

        Object.defineProperty(View.prototype, 'config', {
            get: function () {
                return this._config;
            },
            set: function (options) {
                $.extend(this._config, options);
            }
        });

        View.prototype.speed = function () {
            // TODO
        }

        /*
   v.speed = function(speed) {
   if(!speed)
   return _speed;
   var spd = Math.min(5, Math.max(1, speed)); // 1 <= speed <= 5
   _speed = spd;
   }
   */

        return View;
    })(jQuery);


    S.simpleWrappable = function () {
        var wrappable = {
            live: {},
            async: {}
        };

        wrappable.noCopy = true;

        wrappable.getSync = function () {
            return wrappable.live;
        }

        wrappable.getAsync = function () {
            return wrappable.async;
        }

        return wrappable;
    }

    S.defineComponent('std', function () {
        var std = S.simpleWrappable(),
            vars = {},
            errors = [],
            warnings = [];

        std.live.errors = function () {
            return errors;
        }

        std.live.throwError = function (err) {
            errors.push(err);
        }

        std.live.warnings = function () {
            return warnings;
        }

        std.live.warn = function (msg) {
            console.log('warning: ' + msg);
            warnings.push(msg);
        }

        std.live.set = function (key, value) {
            vars[key] = value;
        }

        std.live.get = function (key) {
            return vars[key];
        }

        std.live.is = function (key, value) {
            return vars[key] === value;
        }

        std.live.log = function (str) {
            console.log(str);
        }

        std.live.flog = null;

        std.live.falert = null;

        std.async.falert = function (str, fn) {
            window.alert(str);
            fn();
        }

        std.async.flog = function (str, fn) {
            console.log(str);
            fn();
        }

        return std;
    }, true);
    S.Deferred = (function () {

        function Deferred() {
            this.context = function (key, value) {
                // expects std component
                if (typeof value === 'undefined')
                    return this.context.get(key);
                this.context.set(key, value);
            };
            this.fns = [];
            this.last = 0;
            this.open = true;
            this.executing = false;
            this.stepTime = 50;

            $.extend(this, new S.EventEmitter());

            this.on('push', function (event) {
                if (open && !this.executing) {
                    console.log('mode is open; executing...');
                    this.exec();
                }
            });

        };

        Deferred.prototype.close = function () {
            this.open = false;
            this.executing = false;
        };

        Deferred.prototype.open = function () {
            this.open = true;
            if (this.fns.length > 0)
                this.exec();
        };

        Object.defineProperty(Deferred.prototype, 'length', {
            get: function () {
                console.log('length get')
                return this.fns.length;
            }
        });

        Object.defineProperty(Deferred.prototype, 'completion', {
            get: function () {
                return this.last / this.length;
            }
        });

        Deferred.prototype.exec = function () {
            this.executing = true;
            var i = this.last,
                self = this;
            //console.log('statements: ' + deferred.getLength());

            function doNext() {
                if (i >= self.fns.length) {
                    //context.fire('end', {}); // remove? todo create event obj
                    self.executing = false;
                    return;
                }
                if (!self.executing) {
                    return;
                }
                // context.fire('update', {}); TODO !!!!!!!
                self.last++;
                self.fns[i++].call({}, function () {
                    //setTimeout(doNext, 50);
                    console.log('doing next...');
                    S.wait(doNext, self.stepTime);
                });
            }

            doNext();
        };

        Deferred.prototype.getContext = function () {
            console.log('returning Deferred.context');
            return this.context;
        }

        Deferred.prototype.add = function (name, func) {
            func.bind(this.context);
            this.context[name] = func;
        }

        Deferred.prototype.wrap = function (wrappables) {
            this.include(S.components.std());
            if (Array.isArray(wrappables)) {
                wrappables.forEach(this.include);
            } else {
                this.include(wrappables);
            }
        }

        Deferred.prototype.include = function (wrappable) {
            var self = this;

            if (typeof wrappable.getSync === 'undefined' || typeof wrappable.getAsync === 'undefined') {
                return console.warn('cannot wrap ' + wrappable + '. no getSync() and/or getAsync() not found.');
            }

            if (!wrappable.noCopy) {
                console.info('Deferred copying ' + wrappable);
                var clone = wrappable.copy();
            }
            console.groupCollapsed('Wrapping methods of \'%s\'', wrappable.alias || wrappable);
            for (var prop in wrappable.getSync()) {
                console.log('Wrapping \'%s\'', prop);
                this.context[prop] =
                // inject property; otherwise, pushed functions will all reference last iterated property
                (function (property, clone) {
                    var deferredMethod = function () {
                        var args = Array.prototype.slice.call(arguments), // convert arguments to an array
                            ret; // = null; // proxy return of sync portion
                        //null indicates that the method is async only (superficial)
                        if (wrappable.getSync()[property] !== null) {
                            //do now
                            if (wrappable.noCopy)
                                ret = wrappable.live[property].apply({}, args);
                            else {
                                //console.log('calling clone');
                                ret = clone.getSync()[property].apply({}, args);
                            }
                        }
                        //push async & sync if found on view:
                        var pushFn;
                        if (wrappable.getAsync().hasOwnProperty(property) && wrappable.getSync()[property] !== null) {
                            // both
                            pushFn = function (fn) {
                                wrappable.getSync()[property].apply(wrappable.getSync(), args);
                                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn)); // concat callback
                            }
                        } else if (wrappable.getSync()[property] !== null) {
                            // sync only
                            pushFn = function (fn) {
                                wrappable.getSync()[property].apply(wrappable.getSync(), args);
                                fn();
                            }
                        } else if (wrappable.getAsync().hasOwnProperty(property)) {
                            // async only
                            pushFn = function (fn) {
                                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn)); // concat callback
                            }
                        } else {
                            // declared as async only, but method not found on view.
                            console.log('method ' + property.toString() + ' was declared as async only (null), but no corresponding view method was found.');
                            pushFn = false;
                        }
                        if (pushFn)
                            self.fns.push(pushFn);
                        self.fire('push', self);
                        if (ret !== null)
                            return ret;
                    };
                    return deferredMethod;
                })(prop, clone);
            }
            console.groupEnd();
            /* now, add in defined methods */

            if (wrappable.getMethods) {
                var methods = wrappable.getMethods();
                console.groupCollapsed('Adding defined methods of \'%s\'', wrappable.alias || wrappable);
                for (var method in methods) {
                    console.log('Adding ' + method);
                    this.add(method, methods[method]);
                }
            } else {
                //console.log('no getMethods found');
            }
            console.groupEnd();
        }


        return Deferred;
    })();


    S.component = function (name, factory, meta) {
        S.defineComponent(name, factory, false);
        if (meta)
            S.setMetaData(name, meta);
    }

    S.method = function (componentName, methodName, func) {
        // TODO
        S.defineMethodOn(componentName, methodName, func);
    };

    S.view = function (componentName, factory) {
        S.setDefaultView(componentName, factory);
    }

    return S;
})(jQuery);
(function (S) {

    function array(arr) {
        var c = new S.Component(), //S.base(),
            flags = [];
        if (arr)
            c.array = arr;
        c.alias = 'array';

        c.copy = function () {
            return array(c.array.slice(0)); // by value copy
        }

        c.live.focus = null;
        c.live.range = null;
        c.live.clearfocus = null;
        c.live.clearrange = null;
        c.live.leftTo = null;

        c.live.getLength = function () {
            return c.array.length;
        }

        c.live.flag = function (index) {
            flags[index] = true;
        }

        c.live.isFlagged = function (index) {
            return !!flags[index];
        }

        c.live.setItem = function (index, value) {
            c.array[index] = value;
        }

        c.live.getItem = function (index) {
            return c.array[index];
        }

        c.live.push = function (item) {
            console.log('pushing ' + item + ' in array.js');
            c.array.push(item);
        }

        c.getMethods = function () {
            return S.getComponentMethods('array');
        }

        return c;
    }
    S.component('array', array, {
        name: 'Array',
        desc: 'A standard array.'
    });
})(window.S);



S.view('array',
    function (options) {
        var view = new S.View(), //S.baseView(),
            $e,
            $table,
            $topRow,
            $bottomRow,
            $cells = $(),
            $indices = $(),
            computedWidth,
            width,
            border = 0,
            computedCellWidth,
            height;

        view.init = function () {
            view.config = {
                hiddenDelimiter: ',',
                numElements: 5,
                pageTime: 300,
                stepTime: 50,
                scrollTime: 500,
                maxScrollTime: 1000
            };
            view.config = options;
            view.leftBound = 0;
            view.rightBound = view.config.numElements - 1;
        }

        view.config = function (options) {
            $.extend(view.config, options);
            view.leftBound = 0;
            view.rightBound = view.config.numElements - 1;
        }

        view.render = function () {
            if ($e)
                $e.remove();
            $cells = $();
            $indices = $();
            $e = $('<div class="array"></div>');
            $table = $('<table></table>');
            $topRow = $('<tr></tr>').addClass('array-top');
            $bottomRow = $('<tr></tr>').addClass('array-bottom');
            $e.append($table);
            $table.append($topRow).append($bottomRow);

            $table.css({
                height: height
            });

            $topRow.css({
                fontSize: Math.round($table.height() * .25)
            });

            for (var i = 0; i < view.component.array.length; i++) {
                var $td = $('<td>' + view.component.array[i] + '<span style="font-size: 0;">' + view.config.hiddenDelimiter + '</span></td>'),
                    $th = $('<th>' + i + '</th>');
                $td.data('index', i);
                $th.data('index', i);
                $td.width(computedCellWidth);
                $th.width(computedCellWidth);
                $td.addClass('array-cell');
                $th.addClass('array-index');
                $topRow.append($td);
                $bottomRow.append($th);
                $cells = $cells.add($td);
                $indices = $indices.add($th);
            }

            computedWidth = computedCellWidth + border;
            width = view.config.numElements * computedWidth + border;
            $e.css('width', width);
            bindEvents($cells);
            view.$element.append($e);
            return view.$element;
        }

        view.scaleTo = function (dimensions) {
            width = dimensions.width;
            height = dimensions.height;
            view.$element.css('width', dimensions.width);
            view.$element.css('height', dimensions.height);
            computedCellWidth = Math.floor(width / view.config.numElements) - border;
            view.render();
        }

        function bindEvents($_cells, $_indices) {
            //$e.mousewheel(handleMousewheel); // TODO needs mousewheel
            $_cells.click(handleTdClick);
            $_cells.dblclick(handleTdDblClick);
        }

        function handleTdClick(e) {
            console.log('handleTdClick');
            console.log('setting focus to ' + $(this).data('index'));
            view.live.focus($(this).data('index'));
        }

        function handleTdDblClick(e) {
            // TODO inform component
            if ($(this).hasClass('flagged'))
                $(this).removeClass('flagged');
            else
                $(this).addClass('flagged');
        }

        function handleMousewheel(e) {
            console.log(e);
            if (e.deltaY < 0) {
                view.left();
            } else {
                view.right();
            }
        }

        function handleKeydown(e) {
            console.log('keyDown');
            if (e.keyCode === 39)
                view.right();
        }

        view.live.focus = function (index, fn) {
            if (index < 0 || index > view.component.array.length - 1)
                return;
            $cells.removeClass('focus');
            $indices.removeClass('focus');
            $cells.eq(index).addClass('focus');
            $indices.eq(index).addClass('focus');
            var idx = index - Math.floor(view.config.numElements / 2);
            view.live.leftTo(idx, fn);
        }

        view.live.clearfocus = function (fn) {
            $cells.removeClass('focus');
            $indices.removeClass('focus');
            fn();
        }

        view.live.flag = function (index, fn) {
            $cells.eq(index).addClass('flagged');
            if (fn) fn();
        }

        view.live.range = function (start, end, num, fn) {
            var $range = $cells.slice(start, end + 1),
                clazz = 'range' + num;
            // TODO why do I do this? -v
            $range.addClass(function (i) {
                var classes = $range.eq(i).attr('class'),
                    newClass = clazz + ' ' + classes;
                $range.eq(i).attr('class', newClass);
            });
            fn();
        }

        view.live.clearrange = function (num, fn) {
            $cells.removeClass('range' + num);
            fn();
        }

        view.live.setItem = function (index, item, fn) {
            view.live.focus(index, function () {
                S.wait(function () {
                    $cells.eq(index).addClass('array-remove');
                    S.wait(function () {
                        $cells.eq(index).text(item);
                        $cells.eq(index).removeClass('array-remove');
                        fn();
                    }, 300);
                }, 200);
            });
        }

        view.live.push = function (item, fn) {
            console.log('pushing ' + item + ' in array.view.js');
            console.log('view.component.array = ' + view.component.array);
            console.log('view.component.array.length = ' + view.component.array.length);
            console.log('view.component.array.length - 1 = ' + view.component.array.length - 1);
            var $added = addItem(item, view.component.array.length - 1);
            view.live.leftTo(view.component.array.length - 1, function () {
                $added.animate({
                    opacity: 1
                }, 200, function () {
                    fn();
                });
            });
        }

        function addItem(item, index) {
            var $newTd = $('<td>' + item + '</td>'),
                $newTh = $('<th>' + index + '</th>');
            var $both = $newTd.add($newTh).css({
                opacity: 0,
                width: computedCellWidth
            });
            $newTd.addClass('array-cell');
            $newTh.addClass('array-index');
            $both.data('index', index);
            $topRow.append($newTd);
            $bottomRow.append($newTh);
            $cells = $cells.add($newTd);
            $indices = $indices.add($newTh);
            bindEvents($newTd, $newTh);
            return $both;
        }

        view.live.leftTo = function (index, fn) {
            index = parseInt(index, 10);
            if (isNaN(index))
                return;
            if (index <= 0)
                index = 0;
            if (index >= view.component.array.length - 1)
                index = view.component.array.length - 1;
            var time = Math.min(Math.abs(index - view.leftBound) * view.config.stepTime, view.config.maxScrollTime);
            if (index == 0) {
                view.leftBound = 0;
                view.rightBound = view.config.numElements - 1;
            } else if (index > view.component.array.length - view.config.numElements) {
                view.leftBound = view.component.array.length - view.config.numElements;
                view.rightBound = view.component.array.length - 1;
            } else {
                view.leftBound = index;
                view.rightBound = index + view.config.numElements - 1;
            }
            scrollTo(index * computedWidth, time, fn);
        }

        view.live.rightTo = function (index) {
            index = parseInt(index, 10);
            if (isNan(index))
                return;
            if (index <= 0)
                index = 0;
            if (index >= view.component.array.length - 1)
                index = view.component.array.length - 1;
            var time = Math.min(Math.abs(index - view.leftBound) * view.config.stepTime, view.config.maxScrollTime);
            if (index <= view.config.numElements - 1) {
                view.leftBound = 0;
                view.rightBound = view.config.numElements - 1;
            } else if (index == view.component.array.length - 1) {
                view.leftBound = view.component.array.length - view.config.numElements;
                view.rightBound = view.component.array.length - 1;
            } else {
                view.leftBound = index - view.config.numElements + 1;
                view.rightBound = index;
            }
            scrollTo(index * computedWidth, time);
        }

        view.pageRight = function () {
            view.leftBound = view.leftBound + view.config.numElements <= view.component.array.length - view.config.numElements ? view.leftBound + view.config.numElements : view.component.array.length - view.config.numElements;
            view.rightBound = view.rightBound + view.config.numElements <= view.component.array.length - 1 ? view.rightBound + view.config.numElements : view.component.array.length - 1;
            page(true);
        }

        view.pageLeft = function () {
            view.leftBound = view.leftBound - view.config.numElements >= 0 ? view.leftBound - view.config.numElements : 0;
            view.rightBound = view.rightBound - view.config.numElements >= view.config.numElements - 1 ? view.rightBound - view.config.numElements : view.config.numElements - 1;
            page(false);
        }

        view.right = function () {
            view.leftBound = view.leftBound + 1 <= view.component.array.length - view.config.numElements ? view.leftBound + 1 : view.component.array.length - view.config.numElements;
            view.rightBound = view.rightBound + 1 <= view.component.array.length - 1 ? view.rightBound + 1 : view.component.array.length - 1;
            step(true);
        }

        view.left = function () {
            view.leftBound = view.leftBound - 1 >= 0 ? view.leftBound - 1 : 0;
            view.rightBound = view.rightBound - 1 >= view.config.numElements - 1 ? view.rightBound - 1 : view.config.numElements - 1;
            step(false);
        }

        function page(right) {
            scroll(right, view.config.pageTime, width - 1);
        }

        function step(right) {
            scroll(right, view.config.stepTime, computedWidth);
        }

        function scroll(right, time, amount) {
            var str = '+=';
            if (!right) str = '-=';
            var anim = {};
            anim.scrollLeft = str + amount;
            $e.animate(anim, time);
            //view.fire('change', {});
        }

        function scrollTo(amount, time, fn) {
            $e.animate({
                scrollLeft: amount
            }, time, function () {
                if (typeof fn !== 'undefined')
                    fn();
            });
        }

        return view;
    });
S.component('tree', function (tree, view) {
    var c = new S.Component(),
        height = 0;
    c.alias = 'tree';


    c.init = function () {
        c.tree = copyTree(tree, null);
        c.state = tree;
        height = computeHeights(c.tree);
        computeHeights(c.tree);
    }

    c.height = function () {
        return height;
    }

    function node(value) {
        return {
            value: value,
            left: null,
            right: null,
            sid: S.nextId()
        };
    }

    function copyTree(_node, parent) {
        if (!_node) return null;
        var n = node(_node.value);
        n.parent = parent;
        n.left = copyTree(_node.left, n);
        n.right = copyTree(_node.right, n);
        return n;
    }

    function computeHeights(root) {
        if (root)
            return root.height = 1 + Math.max(computeHeights(root.left), computeHeights(root.right));
        return -1;
    }

    c.computeHeights = function () {
        computeHeights(c.tree);
    }

    c.live.root = function () {
        if (c.tree)
            return c.tree;
    }

    c.live.height = function () {
        return height;
    }

    c.live.add = function (parent, direction, value) {
        var ret;
        if (direction) {
            ret = parent.right = node(value);
        } else {
            ret = parent.left = node(value);
        }
        computeHeights(c.tree);
        // TODO if avl, avl stuff here
        return ret;
    }

    c.live.clear = function () {
        c.tree = node('__');
    }

    c.live.remove = function (node) {
        /*if(node.parent) {
      if(node.parent.left == node) {
        console.info('Setting parent.left to null');
        node.parent.left = null;
      } else {
        console.info('Setting parent.right to null');
        node.parent.right = null;
      }
    }*/

        if (node.parent && node.parent.left == node) {
            console.info('Setting parent.left to null');
            node.parent.left = null;
        } else if (node.parent && node.parent.right == node) {
            console.info('Setting parent.right to null');
            node.parent.right = null;
        } else {
            console.info('node.parent doesn\'t exist.');
        }

        c.computeHeights();
    }

    c.live.mark = null;

    c.live.markPath = null;

    c.live.clearPath = null;

    c.live.showHeights = null;

    c.live.hideHeights = null;

    c.live.height = null;

    c.live.clearlabels = null;

    c.live.clearfocus = null;

    c.live.travel = null;

    c.live.label = null;

    c.live.focusOn = null;

    c.live.setNode = function (node, value) {
        node.value = value;
    };

    c.live.isBinary = function () {
        return checkBST(c.tree);
    };

    function checkBST(root) {
        if (root) {
            var ret = true;
            if (root.left) {
                ret = root.left.value <= root.value;
            }
            if (root.right && ret) {
                ret = root.right.value >= root.value;
            }
            return ret && checkBST(root.left) && checkBST(root.right);
        } else {
            return true; // null tree is vacuously BST
        }
    }

    c.getMethods = function () {
        return S.getComponentMethods('tree');
    }

    // TODO, add copy method
    c.noCopy = true;

    return c;
});
S.view('tree', function () {
    var view = new S.View(), //new S.View(), //S.baseView(),
        data = S.map(), // stores data about nodes
        $e,
        dom_svg,
        s_svg, // snap svg object
        $svg, // jQuery svg object
        width = 100,
        height = 100,
        nodeRadius = 8,
        mh = 32, // horizontal margin between nodes
        mv = 32, // vertical margin between nodes
        x0, // x offset
        y0; // y offset

    /*
  example node data:
  {
    x: 100,
    y: 100,
    element: [svg element],
    leftLine: [svg element],
    rightLine: [svg element],
    label: 'some text',
    s_value: [svg element],
    s_height: [svg element]
  }
   */

    view.init = function () {

    }


    view.scaleTo = function (dimensions) {
        //console.log('scaling tree');
        width = dimensions.width;
        height = dimensions.height;
        x0 = width / 2;
        nodeRadius = view.config.nodeRadius || .05 * height; // TODO
        y0 = nodeRadius;
        mv = view.config.mv || height / 5; //(height / view.component.height()) - nodeRadius;
        mh = view.config.mh || mv + nodeRadius / 2;
        view.$element.width(width);
        view.$element.height(height);
        view.render();
    }

    view.render = function () {
        //console.log('rendering');
        if ($e) $e.remove();
        $e = $('<div class="tree"></div>');
        dom_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); // http://stackoverflow.com/questions/20045532/snap-svg-cant-find-dynamically-and-successfully-appended-svg-element-with-jqu
        $svg = $(dom_svg)
            .width(width)
            .height(height)
            .appendTo($e);
        s_svg = Snap(dom_svg);
        s_svg.addClass('tree-svg');
        rg(view.component.tree, data, {
            mh: mh,
            mv: mv,
            x0: x0,
            y0: y0
        });
        drawLines(view.component.tree);
        allNodes(view.component.tree, function (node) {
            data(node).element = drawNode(node, data(node).x, data(node).y);
            data(node).s_value = drawValue(node.value, data(node).x, data(node).y);
            data(node).s_height = drawHeight(node);
            drawHeightIcon(node);
        });
        view.$element.append($e);
        return view.$element;
    }

    function drawNode(node, x, y) {
        return circle = s_svg.circle(x + x0, y + y0 + 2, nodeRadius)
            .addClass('tree-node');
    }

    function drawLabel(node, label) {
        return s_svg.text(data(node).x + x0 + nodeRadius + 5, data(node).y + y0 + nodeRadius / 2 - 3, '/' + label)
            .addClass('tree-node-label')
            .attr('text-anchor', 'right')
            .attr('font-size', nodeRadius);
    }

    function drawValue(value, x, y) {
        return s_svg.text(x + x0 /*- 10*/ , y + y0 + nodeRadius * .5, value + '')
            .addClass('tree-node-value')
            .attr('text-anchor', 'middle')
            .attr('font-size', nodeRadius * 1.25);
    }

    function drawLine(xi, yi, xf, yf) {
        return s_svg.line(xi + x0, yi + y0, xf + x0, yf + y0)
            .addClass('tree-line'); //.attr('stroke', 'black');
    }

    function drawHeight(node) {
        return s_svg.text(data(node).x + x0 - nodeRadius - nodeRadius * .85, data(node).y + y0 + nodeRadius / 2 - 3, node.height + '')
            .attr('font-size', nodeRadius)
            .addClass('tree-height');
    }

    function drawHeightIcon(node) {
        //s_svg.image('height.png', data(node).x + x0 - nodeRadius - nodeRadius * 1.1, data(node).y + y0 - nodeRadius * .3, 5, nodeRadius * .75);
    }


    /**
     * Recursive method to draw connecting lines of tree.
     * @param root
     */
    function drawLines(root) {
        if (root.left) {
            data(root).leftLine = drawLine(data(root).x, data(root).y, data(root.left).x, data(root.left).y);
            drawLines(root.left);
        }
        if (root.right) {
            data(root).rightLine = drawLine(data(root).x, data(root).y, data(root.right).x, data(root.right).y);
            drawLines(root.right);
        }
    }

    function allNodes(root, func) {
        if (root) {
            func(root)
            allNodes(root.left, func);
            allNodes(root.right, func);
        }
    }


    view.live.focusOn = function (node, fn) {
        if (!node) return;
        var circle = data(node).element
            .addClass('focus');
        fn();
    }

    view.live.clearfocus = function (fn) {
        data.forEach(function (pair) {
            pair[1].element.removeClass('focus');
        });
        fn();
    }

    view.live.add = function (parent, direction, value, fn) {
        if (direction) {
            data(parent.right).doNotDraw = true;
        } else {
            data(parent.left).doNotDraw = true;
        }
        // TODO animate addition of node
        view.scaleTo({
            width: width,
            height: height
        });
        view.render();
        /*rg(view.component.tree, data, {
      xProperty: 'newX',
      yProperty: 'newY'
    }); */
        //moveToNewPositions(view.component.tree);
        fn();
    }

    function moveToNewPositions(root) {
        if (root) {
            var _data = data(root),
                circle = data.element;
            if (circle) {
                circle.animate({
                    x: _data.newX,
                    y: _data.newY
                }, 1000, null, function () {

                });
            }
            moveToNewPositions(root.left);
            moveToNewPositions(root.right);
        }
    }

    view.live.travel = function (parent, direction, fn) {
        if (direction) {
            if (data(parent).rightLine) {
                var rightLine = data(parent).rightLine;
                rightLine.addClass('tree-line-active');
                var s_circle = s_svg.circle(rightLine.attr('x1'), rightLine.attr('y1'), 5)
                    .addClass('tree-travelorb');
                s_circle.insertAfter(rightLine);
                s_circle.animate({
                    cx: rightLine.attr('x2'),
                    cy: rightLine.attr('y2')
                }, 500, null, function () {
                    s_circle.remove();
                    fn();
                });
            } else {
                fn();
            }
        } else {
            if (data(parent).leftLine) {
                var leftLine = data(parent).leftLine;
                leftLine.addClass('tree-line-active');
                var s_circle = s_svg.circle(leftLine.attr('x1'), leftLine.attr('y1'), 5)
                    .addClass('tree-travelorb');
                s_circle.insertAfter(leftLine);
                s_circle.animate({
                    cx: leftLine.attr('x2'),
                    cy: leftLine.attr('y2')
                }, 500, null, function () {
                    s_circle.remove();
                    fn();
                });
            } else {
                fn();
            }
        }
    };

    view.live.label = function (node, label, fn) {
        if (node && data(node)) {
            data(node).label = label;
            data(node).s_label = drawLabel(node, label);
            fn();
        } else {
            fn();
        }
    }

    view.live.setNode = function (node, value, fn) {
        var s_node = data(node).element,
            s_value = data(node).s_value;
        S.wait(function () {
            s_node.addClass('tree-remove');
            s_value.addClass('tree-remove');
            S.wait(function () {
                s_node.removeClass('tree-remove');
                s_value.removeClass('tree-remove')
                    .attr('text', value);
                fn();
            }, 300);
        }, 200);
    }

    view.live.clear = function (fn) {
        view.render();
        fn();
    }

    view.live.clearlabels = function (fn) {
        data.forEach(function (pair) {
            view.live.clearlabel(pair[0]);
        });
        fn();
    }

    view.live.clearlabel = function (node, fn) {
        if (data(node).s_label) {
            data(node).s_label.remove();
            data(node).label = undefined;
            data(node).s_label = undefined;
        }
        if (fn) fn();
    }

    view.live.showHeights = function (fn) {
        data.forEach(function (pair) {
            view.live.height(pair[0], true);
        });
        fn();
    }

    view.live.hideHeights = function (fn) {
        data.forEach(function (pair) {
            view.live.height(pair[0], false);
        });
        fn();
    }

    view.live.height = function (node, show, fn) {
        if (!node || !data(node).s_height) return;
        console.log('s_height = ' + data(node).s_height);
        if (show)
            data(node).s_height.attr('visibility', 'visible');
        else
            data(node).s_height.attr('visibility', 'hidden');
        if (fn) fn();
    }

    view.live.remove = function (node, fn) {
        var elements = getTreeElements(node),
            parent = node.parent,
            count = 0,
            max;

        if (parent.left == null) {
            elements.push(data(parent).leftLine);
        } else {
            elements.push(data(parent).rightLine);
        }

        max = elements.length;

        elements.forEach(function (element) {
            if (!element) {
                count++;
                return;
            }
            if (element.attr('cy')) {
                element.animate({
                    cy: 1000
                }, 500, mina.easeinout, function () {
                    count++;
                    checkIfAllRemoved();
                });
            } else if (element.attr('y1')) {
                element.animate({
                    y1: 1000,
                    y2: 1000
                }, 500, mina.easeinout, function () {
                    count++;
                    checkIfAllRemoved();
                });
            } else {
                element.animate({
                    y: 1000
                }, 500, mina.easeinout, function () {
                    count++;
                    checkIfAllRemoved();
                });
            }
        });

        function checkIfAllRemoved() {
            console.log('allremoved, count max ' + count + ' ' + max);
            if (count >= max) {
                console.log('all removed!');
                elements.forEach(function (element) {
                    if (element) {
                        element.remove();
                    }
                });
                view.render();
                fn();
            }
        }
    }

    function getTreeElements(root) {
        var ret = [];
        if (root) {
            console.log('element is ' + data(root).element);
            ret.push(data(root).element);
            ret.push(data(root).s_height);
            ret.push(data(root).s_value);
            ret.push(data(root).s_label);
            ret.push(data(root).leftLine);
            ret.push(data(root).rightLine);
            console.log('returning ' + ret.concat(getTreeElements(root.left).concat(getTreeElements(root.right))));
            return ret.concat(getTreeElements(root.left).concat(getTreeElements(root.right)));
        }
        return ret;
    }

    view.live.mark = function (node, num, fn) {
        if (data(node).element) {
            data(node).element.addClass('range' + num);
            fn();
        }
    }

    view.live.markPath = function (node, dir, num, fn) {
        if (dir && data(node).rightLine) {
            data(node).rightLine.addClass('pathrange' + num);
        } else if (data(node).leftLine) {
            data(node).leftLine.addClass('pathrange' + num);
        }
        fn();
    }

    view.live.clearPath = function (node, dir, num, fn) {
        if (dir && data(node).rightLine) {
            data(node).rightLine.removeClass('pathrange' + num);
        } else if (data(node).leftLine) {
            data(node).leftLine.removeClass('pathrange' + num);
        }
        fn();
    }

    view.add = function (parent_s, left, value, fn) {
        /*nodes(parent_s, getNodeElement(value));
    rg(view.component.tree, data, view.config);
    nodes.forEach(function(pair){
      move(nodes(pair[0]), pair[1].x, pair[1].y, function(){
        $e.append(nodes(parent_s));
      });
    });*/
    }

    function move($elem, x, y, fn) {
        /*$elem.animate({
      left: x,
      top: y
    }, 250, function(){
      fn();
    });*/
    }

    /**
     * My (Alex Kizer's) crappy implementation of the Reingold-Tilford algorithm.
     * http://emr.cs.iit.edu/~reingold/tidier-drawings.pdf
     * @param root Root of the tree to draw.
     * @param store A map where position data will be deposited.
     * @param options Options to specify the minimum vertical and horizontal spacing between nodes.
     */
    function rg(root, store, options) {
        //1. copy tree
        //2. run rg
        //3. copy to store


        var config = {
            mh: 10,
            mv: 10,
            xProperty: 'x',
            yProperty: 'y'
        };

        $.extend(config, options);
        var _root = copyTree(root);
        //console.log('printing _root');
        //printTree(_root);
        setup(_root, 0, null, null);
        assign(_root, 0, false);
        copyToStore(_root, store);

        function RNode(node) {
            //console.log('R ' + node.value);
            this.value = node.value;
            this.left = null; //node.left;
            this.right = null; //node.right;
            this.x = 0;
            this.y = 0;
            this.thread = false;
            this.offset = 0;
            this.sid = node.sid;
        }

        function Extreme(node) {
            this.node = node;
            this.offset = 0;
            this.level = 0;
        }

        function copyTree(node) {
            var copy;
            if (!node)
                copy = null;
            else {
                /*copy = {};
         copy.value = node.value;*/
                copy = new RNode(node);
                copy.left = copyTree(node.left);
                copy.right = copyTree(node.right);
            }
            return copy;
        }

        function printTree(root) {
            if (!root)
                return;
            console.log(root.value)
            printTree(root.left);
            printTree(root.right);
        }

        function setup(node, level, rightMost, leftMost) {
            var left,
                right,
                lRightMost = new Extreme(null),
                lLeftMost = new Extreme(null),
                rRightMost = new Extreme(null),
                rLeftMost = new Extreme(null);

            // while loop variables:
            var currentSeparation, // The separation between contour nodes on the current level
                rootSeparation, // ?
                leftOffsetSum, // offset from root
                rightOffsetSum; // offset from root


            if (!node /*== null*/ ) {
                // base case ?
                // ? update leftMost, rightMost
                leftMost.level = -1;
                rightMost.level = -1;
                return;
            }

            node.y = level * config.mv;
            left = node.left;
            //console.log('left is ' + left);
            right = node.right;
            setup(left, level + 1, lRightMost, lLeftMost);
            setup(right, level + 1, rRightMost, rLeftMost);
            if (left === null && right === null) {
                // node is a leaf
                // base case?
                if (leftMost && rightMost) {
                    rightMost.node = node;
                    leftMost.node = node;
                    rightMost.level = level; // single node is both rightMost and leftMost on lowest level (which is current level)
                    leftMost.level = level;
                    rightMost.offset = 0; // ? TODO
                    leftMost.offset = 0; // ? TODO
                }
                node.offset = 0;
            } else {
                // node is not a leaf

                currentSeparation = config.mh; // margin = minimum separation between two nodes on a level
                rootSeparation = config.mh; // ? TODO
                leftOffsetSum = 0;
                rightOffsetSum = 0;

                while (left !== null && right !== null) {

                    if (currentSeparation < config.mh) { // nodes are too close together

                        // Increase rootSeparation just enough so that it accounts for difference between
                        // config.mh and currentSeparation:
                        rootSeparation += (config.mh - currentSeparation);

                        // Now, increase currentSeparation to the minimumSeparation:
                        currentSeparation = config.mh;

                    }

                    // left contour:
                    if (left.right !== null) {

                        // leftOffsetSum is offset of left from root
                        // left.offset = distance to each son
                        // increase leftOffsetSum by left's offset from each child:
                        leftOffsetSum += left.offset;

                        // At this level, now, currentSeparation is decreased by left.offset,
                        // because that is how far out left's right child is stick out.
                        currentSeparation -= left.offset;

                        // Go to next level, next on contour:
                        left = left.right;
                    } else {

                        //left.right is null.

                        // We can move left in now:
                        leftOffsetSum -= left.offset; // ? TODO

                        // We've allowed more separation ?
                        currentSeparation += left.offset;

                        // Go to next level, next on contour:
                        left = left.left;
                    }

                    // right contour:
                    if (right.left !== null) {
                        rightOffsetSum -= right.offset;
                        currentSeparation -= right.offset;
                        right = right.left;
                    } else {
                        rightOffsetSum += right.offset;
                        currentSeparation += right.offset;
                        right = right.right;
                    }

                }

                // set root's offset:
                node.offset = (rootSeparation + 1) / 2;
                // ? TODO :
                leftOffsetSum -= node.offset;
                rightOffsetSum += node.offset;

                // determine 2 extremes from the 4 we have:
                // pick leftMost:
                if (rLeftMost.level > lLeftMost.level || node.left == null) {
                    // rLeftMost wins
                    leftMost = rLeftMost;
                    leftMost.offset += node.offset; // ? TODO
                } else {
                    // lLeftMost wins
                    leftMost = lLeftMost;
                    leftMost.offset -= node.offset;
                }


                // threading:
                // necessary if uneven heights? TODO

                if (left != null && left != node.left && rRightMost.node) {
                    rRightMost.node.thread = true;
                    // no idea what's going on here: TODO
                    rRightMost.node.offset = Math.abs((rRightMost.offset + node.offset) - leftOffsetSum);
                    if (leftOffsetSum - node.offset <= rRightMost.offset) {
                        rRightMost.node.left = left;
                    } else {
                        rRightMost.node.right = left;
                    }
                } else if (right != null && right != node.right && lLeftMost.node) {
                    lLeftMost.node.thread = true;
                    lLeftMost.node.offset = Math.abs((lLeftMost.offset - node.offset) - rightOffsetSum);
                    if (rightOffsetSum + node.offset >= lLeftMost.offset) {
                        lLeftMost.node.right = right;
                    } else {
                        lLeftMost.node.left = right;
                    }
                } else {
                    // nothing
                }

            }


        }

        function assign(node, x, useNew) {
            if (node != null) {
                node.x = x;
                if (node.thread) {
                    // clean up threading:
                    node.thread = false;
                    node.right = null;
                    node.left = null;
                }
                // ? TODO
                assign(node.left, x - node.offset, useNew);
                assign(node.right, x + node.offset, useNew);
            }
        }

        function copyToStore(root, store) {

            if (!root)
                return;
            store(root)[config.xProperty] = root.x;
            store(root)[config.yProperty] = root.y;
            /*store(root, {
        x: root.x,
        y: root.y
      });*/
            copyToStore(root.left, store);
            copyToStore(root.right, store);
        }


    }

    return view;
});
S.method('array', 'finish', function () {
    this.clearfocus();
    this.leftTo(0);
});

S.method('array', 'swap', function (a, b) {
    this.log('swapping');
    this('temp', this.getItem(a));
    this.setItem(a, this.getItem(b));
    this.setItem(b, this('temp'));
});

S.method('array', 'isSorted', function () {
    for (var i = 1; i < this.getLength(); i++) {
        if (this.getItem(i) < this.getItem(i - 1))
            return false;
    }
    return true;
});

S.method('array', 'searchLinear', function (target) {
    for (var i = 0; i < this.getLength(); i++) {
        this.focus(i);
        if (this.getItem(i) == target) {
            this.flag(i);
            return;
        }
    }
    this.finish();
});

S.method('array', 'searchBinary', function (target) {

    if (!this.isSorted()) {
        this.warn('Array is not sorted. Binary search will not behave correctly.');
    }

    function search(left, right) {
        if (right < left) {
            this.clearrange(1);
            this.finish();
            return;
        }
        this.clearrange(1);
        this.range(left, right, 1);
        var mid = Math.floor((left + right) / 2);
        this.focus(mid);
        if (target < this.getItem(mid)) {
            search.call(this, left, mid - 1);
        } else if (target > this.getItem(mid)) {
            search.call(this, mid + 1, right);
        } else {
            this.focus(mid);
            this.flag(mid);
            return;
        }
    }

    search.call(this, 0, this.getLength());

});

console.log('creating insertionSort');
S.method('array', 'insertionSort', function () {
    for (var i = 0; i < this.getLength(); i++) {
        this('j', i);
        while (this('j') > 0 && this.getItem(this('j') - 1) > this.getItem(this('j'))) {
            //swap:
            /*this.log('swapping');
	        this('temp', this.getItem(this('j')));
	        this.setItem(this('j'), this.getItem(this('j') - 1));
	        this.setItem(this('j') - 1, this('temp'));*/
            this.swap(this('j'), this('j') - 1);
            this('swapped', true);
            this('j', this('j') - 1);
        }
        this.range(0, i, 1); //show sorted portion of array
    }
    this.clearrange(1);
    this.finish();
});

S.method('array', 'bubbleSort', function () {
    this('swap', true);
    while (this.is('swap', true)) {
        this('swap', false);
        for (var i = 0; i < this.getLength() - 1; i++) {
            this.focus(i);
            if (this.getItem(i) > this.getItem(i + 1)) {
                // swap
                this.range(i, i + 1, 2);
                /*this('temp', this.getItem(i));
        this.setItem(i, this.getItem(i + 1));
        this.setItem(i + 1, this('temp'));*/
                this.swap(i, i + 1);
                this('swap', true);
                this.clearrange(2);
            }
        }
    }
    this.finish();
});

S.method('array', 'quickSort', function () {
    // TODO
});
S.method('tree', 'finish', function () {
    this.clearfocus();
});

S.method('tree', 'buildBST', function () {
    this.clear();
    this.setNode(this.root(), 12);
    this('left', this.add(this.root(), false, 6));
    this('right', this.add(this.root(), true, 13));
    this.add(this('left'), false, 4);
    this.add(this('right'), true, 14);
});
S.method('tree', 'isBST', function () {

});
S.method('tree', 'traversal', function traversal(kind) {

    var count = 0;
    if (kind)
        kind = kind.trim().toLowerCase();

    if (kind === 'pre' || kind === 'preorder') {
        preorder.call(this, this.root());
    } else if (kind === 'in' || kind === 'inorder') {
        inorder.call(this, this.root());
    } else if (kind === 'post' || kind === 'postorder') {
        postorder.call(this, this.root());
    } else {
        inorder.call(this, this.root());
    }

    this.finish();

    function preorder(node) {
        if (node) {
            visit.call(this, node);
            this.travel(node, false);
            preorder.call(this, node.left);
            this.travel(node, true);
            preorder.call(this, node.right);
        }
    }

    function inorder(node) {
        if (node) {
            this.travel(node, false);
            inorder.call(this, node.left);
            visit.call(this, node);
            this.travel(node, true);
            inorder.call(this, node.right);
        }
    }

    function postorder(node) {
        if (node) {
            this.travel(node, false);
            postorder.call(this, node.left);
            this.travel(node, true);
            postorder.call(this, node.right);
            visit.call(this, node);
        }
    }

    function visit(node) {
        this.focusOn(node);
        label.call(this, node);
    }

    function label(node) {
        this.label(node, count);
        count++;
    }

});
