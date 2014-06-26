S.ee = function() {
  var ee = {};
  ee.registeredEvents = {};

  ee.on = function(eventName, fn) {
    if(typeof ee.registeredEvents[eventName] === 'undefined')
      ee.registeredEvents[eventName] = [];
    ee.registeredEvents[eventName].push(fn);
  };

  ee.fire = function(eventName, event) {
    if(typeof ee.registeredEvents[eventName] === 'undefined')
      return;
    for(var i = 0; i < ee.registeredEvents[eventName].length; i++) {
      ee.registeredEvents[eventName][i].call(event, event);
    }
  };
}