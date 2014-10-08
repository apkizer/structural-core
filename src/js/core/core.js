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
            if(!last[property]) {
                (last[property] = {}).value = null;
            }
            last = last[property];
        });
        last.value = obj;
    };

    S.get = function (path) {
        if(path.indexOf('undefined') > -1) return;
        var nest = path.split('.'),
            last = S.definitions;
        nest.forEach(function (property) {
            if(!last[property]) {
                (last[property] = {}).value = null;
            }
            last = last[property];
        });
        return last.value;
    };

    /*S.modifier = function(component, func) {
        S.define('components.' + component + '.modifiers')
    }*/

    S.component = function(name, ctor) {
        if(ctor)
            S.defineComponent(name, ctor);
        else
            return S.instantiateComponent(name);
    };

    S.defineComponent = function(name, ctor) {
        S.define(ctor, 'components.' + name);
    };

    S.instantiateComponent = function(name) {
        return new S.get('components.' + name);
    }

    S.method = function(func, name, component) {
        var path = 'components.' + component + '.methods';
        if(!S.get(path))
            S.define([], path)
        S.get(path).push({
            name: name,
            func: func
        });
    };

    S.components = function(name) {
        if(typeof S.get('components.' + name) === 'function') {

        }
    };

    S.EventEmitter = function () {
        this.registeredEvents = {};
    }

    S.EventEmitter.prototype.on = function (eventName, fn) {
        if(!this.registeredEvents[eventName])
            this.registeredEvents[eventName] = [];
        this.registeredEvents[eventName].push(fn);
    };

    S.EventEmitter.prototype.fire = function (eventName, event) {
        if(!this.registeredEvents[eventName])
            return;
        for(var i = 0; i < this.registeredEvents[eventName].length; i++) {
            this.registeredEvents[eventName][i].call(event, event);
        }
    };

    return S;
})();