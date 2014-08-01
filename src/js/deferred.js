S.simpleWrappable = function() {
  var wrappable = {
      live: {},
      async: {}
  };

  wrappable.noCopy = true;

  wrappable.getSync = function() {
      return wrappable.live;
  }

  wrappable.getAsync = function() {
      return wrappable.async;
  }

  return wrappable;
}


S.deferred = function() {

  var deferred = {},
      vars = {},
      context = function(key, value) {
          if (typeof value === 'undefined')
              return context.get(key);
          context.set(key, value);
      },
      fns = [],
      last = 0,
      open = true,
      executing = false;

  $.extend(deferred, S.ee());

  var std = S.simpleWrappable()

  std.live.end = function() {
      //algo.fire('end', {}); // todo create event object
  }
  std.live.set = function(key, value) {
      //console.log('DEF setting');
      vars[key] = value;
  }

  std.live.get = function(key) {
      //console.log('DEF getting');
      return vars[key];
  }

  std.live.is = function(key, value) {
      return vars[key] === value;
  }

  std.live.log = function(str) {
      console.log(str);
  }

  std.live.flog = null;

  std.live.falert = null;

  std.async.falert = function(str, fn) {
      window.alert(str);
      fn();
  }

  std.async.flog = function(str, fn) {
      console.log(str);
      fn();
  }

  deferred.wrap = function(wrappables) {
      wrap(std);
      if (Array.isArray(wrappables)) {
          wrappables.forEach(wrap);
      } else {
          wrap(wrappables);
      }

      deferred.close = function() {
          open = false;
      }

      deferred.open = function() {
          open = true;
          if (fns.length > 0) {
              deferred.exec();
          }
      }

      context.pause = function() {
          context.paused = true;
      }

      context.play = function() {
          context.paused = false;
          context.exec();
      }

      context.getIndex = function() {
          return last;
      }

      context.__getLength = function() {
          return fns.length;
      }

      deferred.exec = function() {
          executing = true;
          console.log('exec: fns.length ' + fns.length);
          var i = last;

          function doNext() {
              console.log('doNext');
              console.log(fns[i]);
              if (i >= fns.length) {
                  //context.fire('end', {}); // remove? todo create event obj
                  executing = false;
                  return;
              } else if (context.paused) {
                  return;
              }
              // context.fire('update', {}); TODO !!!!!!!
              last++;
              fns[i++].call({}, function() {
                  setTimeout(doNext, 250);
              });
          }
          doNext();
      }

  };

  function wrap(wrappable) {
      console.log('wrapping!');
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

  return deferred;
}