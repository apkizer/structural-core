S.deferred = function() {
  var deferred = {},
      context = function(key, value) {
        // expects std component
          if (typeof value === 'undefined')
              return context.get(key);
          context.set(key, value);
      },
      fns = [],
      last = 0,
      open = true,
      executing = false,
      stepTime = 50;

  $.extend(deferred, S.ee());
  
  deferred.close = function() {
      open = false;
      executing = false;
  }

  deferred.open = function() {
      open = true;
      if (fns.length > 0) {
          deferred.exec();
      }
  }

  deferred.wrap = function(wrappables) {
      wrap(S.components.std());
      if (Array.isArray(wrappables)) {
          wrappables.forEach(wrap);
      } else {
          wrap(wrappables);
      }
  };

  function wrap(wrappable) {
      if (typeof wrappable.getSync === 'undefined' || typeof wrappable.getAsync === 'undefined') {
          return console.log('cannot wrap ' + wrappable + '. no getSync() and/or getAsync() not found.');
      }
      
      if (!wrappable.noCopy)
          var clone = wrappable.copy();

      for (var prop in wrappable.getSync()) {
          context[prop] =
              // inject property; otherwise, pushed functions will all reference last iterated property
              (function(property, clone) {
                  var deferredMethod = function() {
                      var args = Array.prototype.slice.call(arguments), // convert arguments to an array
                          ret; // = null; // proxy return of sync portion
                      //null indicates that the method is async only (superficial)
                      if (wrappable.getSync()[property] !== null) {
                          //do now
                          //if(wrappable.noCopy)
                          ret = wrappable.live[property].apply({}, args);
                          /* ret = clone.getSync()[property].apply({}, args);*/
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
                          fns.push(pushFn);
                      deferred.fire('push', {});
                      if (ret !== null)
                          return ret;
                  };
                  return deferredMethod;
              })(prop, clone);
      }
      /* now, add in defined methods */
      console.log('now adding defined methods');
      if(wrappable.getMethods) {
        var methods = wrappable.getMethods();
        for(var method in methods) {
          console.log('adding ' + method);
          deferred.add(method, methods[method]);
        }
      } else {
        console.log('no getMethods found');
      }
  }

  deferred.pause = function() {
    context.paused = true;
  }

  deferred.play = function() {
    context.paused = false;
    context.exec();
  }

  deferred.getIndex = function() {
    return last;
  }

  deferred.getLength = function() {
    return fns.length;
  }

  deferred.getCompletion = function() {
    return last / deferred.getLength();
  }

  deferred.setStepTime = function(time) {
    stepTime = time;
  }

  deferred.exec = function() {
    executing = true;
    var i = last;
    console.log('statements: ' + deferred.getLength());

    function doNext() {
      if (i >= fns.length) {
        //context.fire('end', {}); // remove? todo create event obj
        executing = false;
        return;
      } else if (!executing) {
        return;
      }
      // context.fire('update', {}); TODO !!!!!!!
      last++;
      fns[i++].call({}, function() {
        //setTimeout(doNext, 50);
        S.wait(doNext, stepTime);
      });
    }

    doNext();
  }

  deferred.on('push', function(event) {
      console.log('fn pushed!');
      console.log('open=' + open + ', executing=' + executing);
      if (open && !executing) {
          console.log('mode is open; executing...');
          deferred.exec();
      }
  });

  deferred.getContext = function() {
      return context;
  }
  
  deferred.add = function(name, func) {
      func.bind(context);
      context[name] = func;
  }

  return deferred;
}