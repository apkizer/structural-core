S.DeferredInterface = (function(){

  function DeferredInterface(queue) {
    S.EventEmitter.call(this); // TODO phase out?
    this.queue = queue;
    this.clones = {}; // TODO store wrappable clones here
    var self = this;
    this.interface = function(key, value) {
      if (typeof value === 'undefined')
        return self.interface.get(key);
      self.interface.set(key, value);
    };
    this.include(std());
  };

  DeferredInterface.prototype = Object.create(S.EventEmitter.prototype);

  /**
   * Returns the actual interface. After wrappables are included, they can be used from this interface.
   *
   * @returns {Function}
   */
  DeferredInterface.prototype.handle = function() {
    return this.interface;
  }

  DeferredInterface.prototype.add = function(name, func) {
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
      clone = new wrappable.constructor(wrappable.getState());
    }

    console.groupCollapsed('Wrapping methods of \'%s\'', wrappable.alias || wrappable);

    for (var prop in wrappable.getSync()) {
      console.log('Wrapping \'%s\'', prop);
      this.interface[prop] =
        (function(property, clone) {
          var interfaceMethod = function() {
            var args = Array.prototype.slice.call(arguments),
                ret,
                pushFn;

            if (wrappable.getSync()[property] !== null && wrappable.noCopy) {
                ret = wrappable.getSync()[property].apply(wrappable, args);
            } else if(wrappable.getSync()[property] !== null) {
                ret = clone.getSync()[property].apply(clone, args);
            }

            pushFn = function(fn) {
              if(wrappable.getSync()[property])
                wrappable.getSync()[property].apply(wrappable, args);
              if(wrappable.getAsync()[property])
                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn));
              else
                fn();
            };

            self.queue.push.call(self.queue, pushFn);
            return ret;
          };
          return interfaceMethod;
        })(prop, clone);
    }
    console.groupEnd();
    /* now, add in defined methods */

    if(wrappable.getMethods) {
      var methods = wrappable.getMethods();
      console.groupCollapsed('Adding defined methods of \'%s\'', wrappable.alias || wrappable);
      for(var method in methods) {
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
        getAsync: function() {
          return this.async;
        },
        getSync: function() {
          return this.live;
        },
        live: {},
        async: {},
        noCopy: true
      },
        vars = {};
    std.live.log = function(str) {
      console.log(str);
    };
    std.live.warn = function(msg) {
      console.warn(msg);
    };
    std.live.set = function(key, value) {
      vars[key] = value;
    };
    std.live.get = function(key) {
      return vars[key];
    };
    std.live.is = function(key, value) {
      return vars[key] === value;
    };
    std.live.flog = null;
    std.async.flog = function(str, fn) {
      console.log(str);
      fn();
    };
    std.live.fwarn = null;
    std.async.fwarn = function(str, fn) {
      console.warn(str);
      fn();
    };
    return std;
  }

  return DeferredInterface;
})();

