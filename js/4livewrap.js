function live(component) {
  var algo = {},
    fns = [], //array of functions that accept a single callback param
    properties = [],
    open = true;
  algo.paused = false;
  var lastI = 0;



  if(typeof component.live === 'undefined') {
    console.log('cannot livewrap component, no component.live');
    return;
  }


  // build the livewrap. for each method on the component's live, create a clone method which first calls the sync portion of the method, then queues both the sync & async portions
  for(var prop in component.live) {
    algo[prop] =
      // inject property; otherwise, pushed functions will all reference last iterated property
      (function(property){
        var func = function() {
          if(!open)
            return;

          var args = Array.prototype.slice.call(arguments), // convert arguments to an array
            ret = null; // proxy return of sync portion

          //null indicates that the method is async only (superficial)

          if(component.live[property] !== null) {
            //do now
            ret = component.live[property].apply({}, args);
          }

          //push async & sync if found on view:
          var pushFn;
          // 3 cases:
          // * both sync and async
          // * only sync
          // * only async
          if(component.view.hasOwnProperty(property) && component.live[property] !== null) {
            // both
            pushFn = function(fn) {
              component.live[property].apply(component.live, args);
              component.view[property].apply(component.view, args.concat(fn)); // concat callback
            }
          } else if(component.live[property] !== null) {
            // sync only
            pushFn = function(fn) {
              component.live[property].apply(component.live, args);
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
            return;
          }


          if(component.view.hasOwnProperty(property)) {
            pushFn = function(fn) {
              // call sync:
              if(component.live[property] !== null)
                component.live[property].apply(component.live, args); //  does args change?
              // call async with callback added
              component.view[property].apply(component.view, args.concat(fn));
            }
            pushFn.sync = false;
          } else {
            // not found on view, so is sync only
            pushFn = function(fn) {
              // call sync:
              component.live[property].apply({}, args); //  does args change?
              // do not call async
            }
            pushFn.sync = true; // mark as sync only
          }

          fns.push(pushFn);



          if(ret !== null) {
            console.log('proxy returning ' + ret);
            return ret;
          }
        };
        return func;
      })(prop);
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
    return lastI;
  }
  algo.getLength = function() {
    return fns.length;
  }
  algo.exec = function() {
    if(open)
      return;
    var i = lastI;
    function doNext() {
      if(i >= fns.length || algo.paused)
        return;
      if(algo.update)
        algo.update();
      //sync override
      if(fns[i].sync) {
        console.log('sync detected');
        fns[i++].call({});
        lastI++;
        doNext();
      } else {
        lastI++;
        fns[i++].call({}, function(){
          setTimeout(doNext, /*options.sleep ||*/ 300);
        });
      }
    }
    doNext();
  }

  return algo;
}