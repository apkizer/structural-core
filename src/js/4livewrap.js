S.live = function(component) {
    
  var algo = function(key, value){
      if(!value)
        return algo.get(key);
      algo.set(key, value);
    },
    fns = [], //array of functions that accept a single callback param
    properties = [],
    open = true,
    last = 0,
    vars = {}; // TODO move to std

  //mixin event handling:
  $.extend(algo, S.ee());

  algo.paused = false;

  var std = S.simpleWrappable()

  std.live.end = function(){
    algo.fire('end', {}); // todo create event object
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

  algo.wrap = function(item, wrapAlgo) {
    if(typeof item.getSync === 'undefined' || typeof item.getAsync === 'undefined') {
      console.log('cannot livewrap item. no item.getSync() or item.getAsync()');
      return;
    }
    for(var prop in item.getSync()) {
      algo[prop] =
        // inject property; otherwise, pushed functions will all reference last iterated property
        (function(property){
          var func = function() {
            if(!open)
              return;
            var args = Array.prototype.slice.call(arguments), // convert arguments to an array
              ret = null; // proxy return of sync portion
            //null indicates that the method is async only (superficial)
            if(item.getSync()[property] !== null) {
              //do now
              ret = item.live[property].apply({}, args);
            }
            //push async & sync if found on view:
            var pushFn;
            if(item.getAsync().hasOwnProperty(property) && item.getSync()[property] !== null) {
              // both
              pushFn = function(fn) {
                item.getSync()[property].apply(item.getSync(), args);
                item.getAsync()[property].apply(item.getAsync(), args.concat(fn)); // concat callback
              }
            } else if(item.getSync()[property] !== null) {
              // sync only
              pushFn = function(fn) {
                item.getSync()[property].apply(item.getSync(), args);
                fn();
              }
            } else if(item.getAsync().hasOwnProperty(property)) {
              // async only
              pushFn = function(fn) {
                item.getAsync()[property].apply(item.getAsync(), args.concat(fn)); // concat callback
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
  }

  algo.wrap(std);
  if(Array.isArray(component)) {
      console.log('is array!');
    component.forEach(function(c){
      algo.wrap(c);
    });
  } else {
    algo.wrap(component);
  }

  algo.close = function() {
    open = false;
  }

  algo.pause = function(){
    algo.paused = true;
  }

  algo.play = function() {
    algo.paused = false;
    algo.exec();
  }

  algo.getIndex = function() {
    return last;
  }

  algo.__getLength = function() {
    return fns.length;
  }

  algo.exec = function() {
    console.log('exec: fns.length ' + fns.length);
    if(open)
      return;
    var i = last;
    function doNext() {
      console.log('doNext');
      console.log(fns[i]);
      if(i >= fns.length) {
        algo.fire('end', {}); // todo create event obj
        return;
      }
      else if(algo.paused) {
        return;
      }
      algo.fire('update', {});
      last++;
      fns[i++].call({}, function(){
        setTimeout(doNext, 0);
      });
    }
    doNext();
  }
  
  algo.finish = function() {
      
  }

  return algo;
}