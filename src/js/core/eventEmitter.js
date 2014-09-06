S.EventEmitter = function () {
  this.registeredEvents = {};
}

S.EventEmitter.prototype.on = function(eventName, fn) {
  if(!this.registeredEvents[eventName])//typeof this.registeredEvents[eventName] === 'undefined')
    this.registeredEvents[eventName] = [];
  this.registeredEvents[eventName].push(fn);
};

S.EventEmitter.prototype.fire = function(eventName, event) {
  if(!this.registeredEvents[eventName])//typeof this.registeredEvents[eventName] === 'undefined')
    return;
  for(var i = 0; i < this.registeredEvents[eventName].length; i++) {
    this.registeredEvents[eventName][i].call(event, event);
  }
};


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

  return ee;
}