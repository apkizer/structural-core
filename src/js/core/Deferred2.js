S.Deferred = (function(){

  function Deferred() {
    S.EventEmitter.call(this);
    this.context = new S.DeferredInterface();

    //$.extend(this, new S.EventEmitter());

    this.on('push', function(event) {
      if (open && !this.executing) {
        console.log('mode is open; executing...');
        this.exec();
      }
    });

  };

  Deferred.prototype = Object.create(S.EventEmitter.prototype);

  Deferred.prototype.close = function() {
    this.open = false;
    this.executing = false;
  };

  Deferred.prototype.open = function() {
    this.open = true;
    if (this.fns.length > 0)
      this.exec();
  };

  Object.defineProperty(Deferred.prototype, 'length', {
    get: function() {
      console.log('length get')
      return this.fns.length;
    }
  });

  Object.defineProperty(Deferred.prototype, 'completion', {
    get: function() {
      return this.last / this.length;
    }
  });

  Deferred.prototype.exec = function() {
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
      self.fns[i++].call({}, function() {
        //setTimeout(doNext, 50);
        console.log('doing next...');
        S.wait(doNext, self.stepTime);
      });
    }

    doNext();
  };

  Deferred.prototype.getContext = function() {
    console.log('returning Deferred.context');
    return this.context;
  }

  Deferred.prototype.add = function(name, func) {
    func.bind(this.context);
    this.context[name] = func;
  }

  Deferred.prototype.wrap = function(wrappables) {
    this.include(S.components.std());
    if (Array.isArray(wrappables)) {
      wrappables.forEach(this.include);
    } else {
      this.include(wrappables);
    }
  }

  Deferred.prototype.include = function (wrappable) {
    var self = this,
      clone;

    if (typeof wrappable.getSync === 'undefined' || typeof wrappable.getAsync === 'undefined') {
      return console.warn('cannot wrap ' + wrappable + '. no getSync() and/or getAsync() not found.');
    }

    if (!wrappable.noCopy) {
      console.info('Deferred copying ' + wrappable);
      //var clone = wrappable.copy();
      clone = new wrappable.constructor(wrappable.state);
    }
    console.groupCollapsed('Wrapping methods of \'%s\'', wrappable.alias || wrappable);
    for (var prop in wrappable.getSync()) {
      console.log('Wrapping \'%s\'', prop);
      this.context[prop] =
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


  return Deferred;
})();

