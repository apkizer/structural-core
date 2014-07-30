  S.simpleWrappable = function() {
    var wrappable = {
      live: {},
      async: {}
    };
      
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
        context = function(key, value){
            if(!value)
                return context.get(key);
            context.set(key, value);
        },
        queue = [],
        open = true;
    
    $.extend(deferred, S.ee());
  
    deferred.wrap = function(wrappables){
        if(Array.isArray(wrappables)) {
            wrappables.forEach(wrap);
        } else {
            wrap(wrappables);
        }
        
  context.close = function() {
    open = false;
  }

  context.pause = function(){
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

  context.exec = function() {
    console.log('exec: fns.length ' + fns.length);
    if(open)
      return;
    var i = last;
    function doNext() {
      console.log('doNext');
      console.log(fns[i]);
      if(i >= fns.length) {
        context.fire('end', {}); // remove? todo create event obj
        return;
      }
      else if(context.paused) {
        return;
      }
      context.fire('update', {});
      last++;
      fns[i++].call({}, function(){
        setTimeout(doNext, 0);
      });
    }
    doNext();
  }
        
    };
    
    function wrap(wrappable) {
        
        
    if(typeof wrappable.getSync === 'undefined' || typeof wrappable.getAsync === 'undefined') {
      return console.log('cannot wrap ' + wrappable + '. no getSync() and/or getAsync() not found.');
    }
        
    var clone = wrappable.copy();

    for(var prop in wrappable.getSync()) {
      context[prop] =
        // inject property; otherwise, pushed functions will all reference last iterated property
        (function(property, clone){
          var deferredMethod = function() {
            if(!open)
              return;
            var args = Array.prototype.slice.call(arguments), // convert arguments to an array
              ret;// = null; // proxy return of sync portion
            //null indicates that the method is async only (superficial)
            if(wrappable.getSync()[property] !== null) {
              //do now
             /* ret = wrappable.live[property].apply({}, args);*/
                ret = clone.getSync()[property].apply({}, args);
            }
            //push async & sync if found on view:
            var pushFn;
            if(wrappable.getAsync().hasOwnProperty(property) && wrappable.getSync()[property] !== null) {
              // both
              pushFn = function(fn) {
                wrappable.getSync()[property].apply(wrappable.getSync(), args);
                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn)); // concat callback
              }
            } else if(wrappable.getSync()[property] !== null) {
              // sync only
              pushFn = function(fn) {
                wrappable.getSync()[property].apply(wrappable.getSync(), args);
                fn();
              }
            } else if(wrappable.getAsync().hasOwnProperty(property)) {
              // async only
              pushFn = function(fn) {
                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn)); // concat callback
              }
            } else {
              // declared as async only, but method not found on view.
              console.log('method ' + property.toString() + ' was declared as async only (null), but no corresponding view method was found.');
              pushFn = false;
            }
            if(pushFn)
              fns.push(pushFn);
            if(ret !== null)
              return ret;
          };
          return deferredMethod;
        })(prop, clone);
    }
        
        
        
    }
    
    deferred.getContext = function() {
        return context;
    }
    
    return deferred;
    
 /* var context = function(key, value){
      if(!value)
        return context.get(key);
      context.set(key, value);
    },
    fns = [], //array of functions that accept a single callback param
    properties = [],
    open = true,
    last = 0,
    vars = {}; // TODO move to std

  //mixin event handling:
  $.extend(context, S.ee());

  context.paused = false;

  var std = S.simpleWrappable();

  std.live.end = function(){
    context.fire('end', {}); // todo create event object
  }
  
  std.live.set = function(key, value) {
    vars[key] = value;
  }

  std.live.get = function(key) {
    return vars[key];
  }

  std.live.is = function(key, value) {
    return vars[key] === value;
  }

  std.live.log = function(str) {
      console.log(str);
  }

  // build the livewrap. for each method on the component's live, create a clone method which first calls the sync portion of the method, then queues both the sync & async portions

  context.wrap = function(wrappable, wrapcontext) {
    if(typeof wrappable.getSync === 'undefined' || typeof wrappable.getAsync === 'undefined') {
      console.log('cannot livewrap wrappable. no wrappable.getSync() or wrappable.getAsync()');
      return;
    }
    for(var prop in wrappable.getSync()) {
      context[prop] =
        // inject property; otherwise, pushed functions will all reference last iterated property
        (function(property){
          var func = function() {
            if(!open)
              return;
            var args = Array.prototype.slice.call(arguments), // convert arguments to an array
              ret = null; // proxy return of sync portion
            //null indicates that the method is async only (superficial)
            if(wrappable.getSync()[property] !== null) {
              //do now
              ret = wrappable.live[property].apply({}, args);
            }
            //push async & sync if found on view:
            var pushFn;
            if(wrappable.getAsync().hasOwnProperty(property) && wrappable.getSync()[property] !== null) {
              // both
              pushFn = function(fn) {
                wrappable.getSync()[property].apply(wrappable.getSync(), args);
                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn)); // concat callback
              }
            } else if(wrappable.getSync()[property] !== null) {
              // sync only
              pushFn = function(fn) {
                wrappable.getSync()[property].apply(wrappable.getSync(), args);
                fn();
              }
            } else if(wrappable.getAsync().hasOwnProperty(property)) {
              // async only
              pushFn = function(fn) {
                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn)); // concat callback
              }
            } else {
              // declared as async only, but method not found on view.
              console.log('method ' + property.toString() + ' was declared as async only (null), but no corresponding view method was found.');
              pushFn = false;
            }
            if(pushFn)
              fns.push(pushFn);
            if(ret !== null)
              return ret;
          };
          return func;
        })(prop);
    }
  }*/

 /* context.wrap(std);
  if(Array.isArray(component)) {
      console.log('is array!');
    component.forEach(function(c){
      context.wrap(c);
    });
  } else {
    context.wrap(component);
  }*/


  
  context.finish = function() {
      
  }

  return deferred;
}