S.Deferred = (function () {

    var defaults = {

    };

    function Deferred (queue) {
        var self = this;
        S.EventEmitter.call(this);
        this.queue = queue;
        this.handle = {};
        this.handle.standard = function (key, value) {
            if (typeof value === 'undefined')
                return self.handle.standard._get(key);
            self.handle.standard._set(key, value);
        }
        this.include(std(), std(), {
            name: 'standard'
        });
    }

    Deferred.prototype = Object.create(S.EventEmitter.prototype);

    Deferred.prototype.include = function (component, copy, options) {
        var options = S.extend(defaults, options),
            _interface = this.handle[options.name || component] ? this.handle[options.name || component] : this.handle[options.name || component] = {},
            self = this,
            definedMethods = S.get('components.' + component.alias + '.methods');
        console.dir(component);
        for (var property in component) {
            if(typeof component[property] !== 'function' || !component[property].live)
                continue;
            _interface[property] = (function (property) {
                var method = function () {
                    var args = Array.prototype.slice.call(arguments);
                    self.queue.push(function(fn) {
                        component[property].apply(component, args.concat(fn));
                    });
                    return copy[property].apply(copy, args);
                };
                return method;
            })(property);
        }
        console.dir(definedMethods);
        if(!definedMethods || definedMethods.length == 0) return;
        definedMethods.forEach(function (definedMethod) {
            if(!_interface[definedMethod.name]) {
                console.info('Including %s', definedMethod.name);
                _interface[definedMethod.name] = function () {
                    definedMethod.func.call(self.standard, _interface);
                };
            }
        });
    };

    function std () {
        var standard = {},
            vars = {};
        standard.flog = function (str, fn) {
            console.log(str);
            if(fn) fn();
        };
        standard.flog.live = true;
        standard.fwarn = function(str, fn) {
            console.warn(str);
            if(fn) fn();
        };
        standard.fwarn.live = true;
        standard._set = function (key, value, fn) {
            vars[key] = value;
            if(fn) fn();
        };
        standard._set.live = true;
        standard._get = function (key, fn) {
            if(fn) fn();
            return vars[key];
        };
        standard._get.live = true;
        standard.comment = function (str) {
            // TODO
        };
        standard.comment.live = true;
        return standard;
    }

    return Deferred;
})();