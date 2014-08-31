/*if (wrappable.getAsync().hasOwnProperty(property) && wrappable.getSync()[property] !== null) {
 // both
 pushFn = function(fn) {
 wrappable.getSync()[property].apply(wrappable, args);
 wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn)); // concat callback
 }
 } else if (wrappable.getSync()[property] !== null) {
 // sync only
 pushFn = function(fn) {
 wrappable.getSync()[property].apply(wrappable, args);
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
 }*/