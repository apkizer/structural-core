S.DeferredInterface = (function () {

    function DeferredInterface(queue) {
        S.EventEmitter.call(this); // TODO phase out?
        this.queue = queue;
        this.clones = {}; // TODO store wrappable clones here
        var self = this;
        this.interface = function (key, value) {
            if (typeof value === 'undefined')
                return self.interface._get(key);
            self.interface._set(key, value);
        };
        this.include(std());
    };

    DeferredInterface.prototype = Object.create(S.EventEmitter.prototype);

    /**
     * Returns the actual interface. After wrappables are included, they can be used from this interface.
     *
     * @returns {Function}
     */
    DeferredInterface.prototype.handle = function () {
        return this.interface;
    }

    DeferredInterface.prototype.add = function (name, func) {
        func.bind(this.interface);
        this.interface[name] = func;
    }

    /**
     * Include a wrappable in this interface. Operations are pushed to this DeferredInterface's queue, and also executed
     * on a stateful copy of the wrappable. The result is that objects with asynchronous behavior can be coded synchronously.
     * @param wrappable An object which satisfies the `wrappable` interface.
     */
    DeferredInterface.prototype.include = function (wrappable) {
        // console.info('Including ' + wrappable);
        var self = this,
            clone;
        console.assert(wrappable.getSync && wrappable.getAsync, '`wrappable` satisfies interface.');
        if (!wrappable.noCopy) {
            clone = new wrappable.constructor(wrappable.state);
        }

        console.groupCollapsed('Wrapping methods of \'%s\'', wrappable.alias || wrappable);
        console.dir(wrappable);

        for (var prop in wrappable.getSync()) {
            console.log('Wrapping \'%s\'', prop);
            var interfaceMethod =
                (function (property, clone) {
                    var interfaceMethod = function () {
                        var args = Array.prototype.slice.call(arguments),
                            ret,
                            pushFn;

                        if (wrappable.getSync()[property] !== null && wrappable.noCopy) {
                            ret = wrappable.getSync()[property].apply(wrappable, args);
                        } else if (wrappable.getSync()[property] !== null) {
                            ret = clone.getSync()[property].apply(clone, args.concat(self.interface));
                        }

                        var pushFn = function (fn) {
                            fn.deferredInterface = self;
                            fn.speed = 1; // TODO
                            if (wrappable.getSync()[property])
                                wrappable.getSync()[property].apply(wrappable, args.concat(self.interface));
                            if (wrappable.getAsync()[property])
                                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn));
                            else
                                fn();
                        };

                        pushFn.toString = function () {
                            return property;
                        };

                        self.queue.push.call(self.queue, pushFn);
                        return ret;
                    };
                    return interfaceMethod;
                })(prop, clone);
            (function(interfaceMethod) {
                if(wrappable.getSync()[prop] && wrappable.getSync()[prop].getter && wrappable.getSync()[prop].setter) {
                    Object.defineProperty(self.interface, prop, {
                        get: function() {
                            return interfaceMethod();
                        },
                        set: function(value) {
                            return interfaceMethod(value);
                        }
                    });
                }
                else if(wrappable.getSync()[prop] && wrappable.getSync()[prop].getter) {
                    Object.defineProperty(self.interface, prop, {
                        get: function() {
                            return interfaceMethod();
                        }
                    });
                }
                else if(wrappable.getSync()[prop] && wrappable.getSync()[prop].setter) {
                    Object.defineProperty(self.interface, prop, {
                        set: function(value) {
                            return interfaceMethod(value);
                        }
                    });
                } else {
                    self.interface[prop] = interfaceMethod;
                }
            })(interfaceMethod);
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

    function std() {
        var std = {
                getAsync: function () {
                    return this.async;
                },
                getSync: function () {
                    return this.live;
                },
                live: {},
                async: {},
                noCopy: true
            },
            vars = {};
        std.live.log = function (str) {
            console.log(str);
        };
        std.live.warn = function (msg) {
            console.warn(msg);
        };
        std.live._set = function (key, value) {
            vars[key] = value;
        };
        std.live._get = function (key) {
            return vars[key];
        };
        std.live.is = function (key, value) {
            return vars[key] === value;
        };
        std.live.flog = null;
        std.async.flog = function (str, fn) {
            console.log(str);
            fn();
        };
        std.live.fwarn = null;
        std.async.fwarn = function (str, fn) {
            console.warn(str);
            fn();
        };
        return std;
    }

    return DeferredInterface;
})();

