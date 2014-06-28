function live(component) {
  var algo = function(key, value){
      if(!value)
        return algo.get(key);
      algo.set(key, value);
    },
    fns = [], //array of functions that accept a single callback param
    properties = [],
    open = true;
  algo.paused = false;
  var last = 0;
  var vars = {};

  //mixin event handling:
  $.extend(algo, S.ee());

  if(typeof component.live === 'undefined') {
    console.log('cannot livewrap component, no item.live');
    return;
  }

  var std = S.simpleWrappable();


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


  algo.wrap = function(item) {
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
              //console.log('donow');
              ret = item.live[property].apply({}, args);
            } else {
              //console.log('no donow on property ' + property);

            }

            //push async & sync if found on view:
            var pushFn;
            // 3 cases:
            // * both sync and async
            // * only sync
            // * only async
            if(component.view.hasOwnProperty(property) && item.getSync()[property] !== null) {
              // both
              pushFn = function(fn) {
                item.getSync()[property].apply(item.getSync(), args);
                component.view[property].apply(component.view, args.concat(fn)); // concat callback
              }
            } else if(item.getSync()[property] !== null) {
              // sync only
              pushFn = function(fn) {
                item.getSync()[property].apply(item.getSync(), args);
                fn();
              }
            } else if(component.view.hasOwnProperty(property)) {
              // async only
              pushFn = function(fn) {
                component.view[property].apply(component.view, args.concat(fn)); // concat callback
              }
            } else {
              // declared as async only, but method not found on view.
              console.log('method ' + property.toString() + ' was declared as async only (null), but no corresponding view method was found.');
              pushFn = function(fn) {
                fn();
              }
            }


            /*if(component.view.hasOwnProperty(property)) {
             pushFn = function(fn) {
             // call sync:
             if(item.live[property] !== null)
             item.live[property].apply(item.live, args); //  does args change?
             // call async with callback added
             component.view[property].apply(component.view, args.concat(fn));
             }
             pushFn.sync = false;
             } else {
             // not found on view, so is sync only
             pushFn = function(fn) {
             // call sync:
             item.live[property].apply({}, args); //  does args change?
             // do not call async
             }
             pushFn.sync = true; // mark as sync only
             }*/

            fns.push(pushFn);

            if(ret !== null) {
              // proxy return
              return ret;
            }
          };
          return func;
        })(prop);
    }
  }

  algo.wrap(std);
  if(Array.isArray(component)) {
    component.forEach(function(c){
      algo.wrap(c);
    });
  } else {
    algo.wrap(component);
  }
  algo.wrap(component);

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
    if(open)
      return;
    var i = last;
    function doNext() {
      console.log('doNext');
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

  return algo;
}