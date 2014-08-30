S.DeferredInterface = (function(){

  function DeferredInterface(queue) {
    S.EventEmitter.call(this); // TODO phase out?
    this.queue = queue;
    this.interface = function(key, value) {
      if (typeof value === 'undefined')
        return this.interface.get(key);
      this.interface.set(key, value);
    };
    this.include(getStandardWrappable());
  };

  DeferredInterface.prototype = Object.create(S.EventEmitter.prototype);

  DeferredInterface.prototype.handle = function() {
    return this.interface;
  }

  DeferredInterface.prototype.add = function(name, func) {
    func.bind(this.interface);
    this.interface[name] = func;
  }

  DeferredInterface.prototype.include = function (wrappable) {

    console.info('Including ' + wrappable);

    var self = this,
        clone;

    console.assert(wrappable.getSync && wrappable.getAsync, 'wrappable satisfies interface.');

    if (!wrappable.noCopy) {
      console.info('Deferred copying ' + wrappable);
      //var clone = wrappable.copy();
      clone = new wrappable.constructor(wrappable.state);
    }

    console.groupCollapsed('Wrapping methods of \'%s\'', wrappable.alias || wrappable);

    for (var prop in wrappable.getSync()) {
      console.log('Wrapping \'%s\'', prop);
      this.interface[prop] =
        // inject property; otherwise, pushed functions will all reference last iterated property
        (function(property, clone) {

          var deferredMethod = function() {
            var args = Array.prototype.slice.call(arguments), // convert arguments to an array
              ret; // = null; // proxy return of sync portion
            //null indicates that the method is async only (superficial)
            if (wrappable.getSync()[property] !== null) {
              //do now
              if(wrappable.noCopy)
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
              pushFn = function(fn) {
                wrappable.getSync()[property].apply(wrappable.getSync(), args);
                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn)); // concat callback
              }
            } else if (wrappable.getSync()[property] !== null) {
              // sync only
              pushFn = function(fn) {
                wrappable.getSync()[property].apply(wrappable.getSync(), args);
                fn();
              }
            } else if (wrappable.getAsync().hasOwnProperty(property)) {
              // async only
              pushFn = function(fn) {
                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn)); // concat callback
              }
            } else {
              // declared as async only, but method not found on view.
              console.log('method ' + property.toString() + ' was declared as async only (null), but no corresponding view method was found.');
              pushFn = false;
            }
            if (pushFn)
              self.queue.push.call(self.queue, pushFn);
            self.fire('push', self);
            if (ret !== null)
              return ret;
          };


          return deferredMethod;
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

  function getStandardWrappable() {
    var standard = S.simpleWrappable(),
        vars = {};

    standard.live.log = function(str) {
      console.log(str);
    }

    standard.live.warn = function(msg) {
      console.warn(msg);
    }

    standard.live.set = function(key, value) {
      vars[key] = value;
    }

    standard.live.get = function(key) {
      return vars[key];
    }

    standard.live.is = function(key, value) {
      return vars[key] === value;
    }

    standard.live.flog = null;

    standard.async.flog = function(str, fn) {
      console.log(str);
      fn();
    };

    standard.live.fwarn = null;

    standard.async.fwarn = function(str, fn) {
      console.warn(str);
      fn();
    };

    return standard;
  }


  return DeferredInterface;
})();

