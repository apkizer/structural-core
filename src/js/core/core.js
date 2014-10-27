window.S = (function () {
    "use strict";
    var S = {};
    S.definitions = {};

    /**
     * Global definition function. Allows properties to be defined in any order.
     * @param obj
     * @param path
     */
    S.define = function (obj, path) {
        console.info('Defining %s', path);
        var nest = path.split('.'),
            last = S.definitions;
        nest.forEach(function (property) {
            if (!last[property]) {
                (last[property] = {}).value = null;
            }
            last = last[property];
        });
        last.value = obj;
    };

    S.get = function (path) {
        if (path.indexOf('undefined') > -1) return;
        var nest = path.split('.'),
            last = S.definitions;
        nest.forEach(function (property) {
            if (!last[property]) {
                (last[property] = {}).value = null;
            }
            last = last[property];
        });
        return last.value;
    };

    S.component = function (name, ctor) {
        if (ctor)
            S.defineComponent(name, ctor);
        else
            return S.instantiateComponent(name);
    };

    S.defineComponent = function (name, ctor) {
        S.define(ctor, 'components.' + name);
    };

    S.instantiateComponent = function (name) {
        return new S.get('components.' + name);
    }

    S.method = function (func, name, component) {
        var path = 'components.' + component + '.methods';
        if (!S.get(path))
            S.define([], path)
        S.get(path).push({
            name: name,
            func: func
        });
    };

    S.EventEmitter = function () {
        this.registeredEvents = {};
    }

    S.EventEmitter.prototype.on = function (eventName, fn) {
        if (!this.registeredEvents[eventName])
            this.registeredEvents[eventName] = [];
        this.registeredEvents[eventName].push(fn);
    };

    S.EventEmitter.prototype.fire = function (eventName, event) {
        if (!this.registeredEvents[eventName])
            return;
        for (var i = 0; i < this.registeredEvents[eventName].length; i++) {
            this.registeredEvents[eventName][i].call(event, event);
        }
    };

    /**
     * Shallow extend utility.
     */
    S.extend = function () {
        var args = Array.prototype.slice.call(arguments),
            ret = {};
        args.forEach(function (mixin) {
            for (var property in mixin) {
                if (!mixin.hasOwnProperty(property)) continue;
                ret[property] = mixin[property];
            }
        });
        return ret;
    };

    /**
     * Map utility.
     */
    S.map = function () {
        var values = {},
            keys = {},
            map = function (key, value) {
                if (!key.id)
                    throw new Error('S.map() requires id property');
                if (typeof value === 'undefined') {
                    if (!values[key.id])
                        values[key.id] = {};
                    return values[key.id];
                }
                values[key.id] = value;
                keys[key.id] = key;
            };

        map.clear = function () {
            values = {};
            keys = {};
        };

        map.delete = function (key) {
            if (!key.id)
                throw new Error('S.map() requires id property');
            delete values[key.id];
        };

        map.has = function (key) {
            if (!key.id)
                throw new Error('S.map() requires id property');
            return typeof values[key.id] !== 'undefined';
        }

        map.forEach = function (fn, thisArg) {
            if (!thisArg)
                thisArg = {};
            for (var id in values) {
                fn.call(thisArg, [keys[id], values[id]]);
            }
        }

        return map;
    };

    /**
     * setTimeout shorthand.
     */
    S.wait = function (func, time) {
        setTimeout(func, time);
    };

    return S;
})();
