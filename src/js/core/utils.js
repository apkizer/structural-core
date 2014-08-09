var id = 0;

S.nextId = function() {
  return 'sid_' + id++;
}

S.map = function() {
  var values = {},
    keys = {},
    map = function(key, value) {
      if(!key.sid)
        throw new Error('S.map() requires sid property. Use S.nextId().');
      if(typeof value === 'undefined') {
        if(!values[key.sid])
          values[key.sid] = {};
        return values[key.sid];
      }
      values[key.sid] = value;
      keys[key.sid] = key;
    };

  map.clear = function() {
    values = {};
    keys = {};
  };

  map.delete = function(key) {
    if(!key.sid)
      throw new Error('S.map() requires sid property. Use S.nextId().');
    delete values[key.sid];
  };

  map.has = function(key) {
    if(!key.sid)
      throw new Error('S.map() requires sid property. Use S.nextId().');
    return typeof values[key.sid] !== 'undefined';
  }

  map.forEach = function(fn, thisArg) {
    if(!thisArg)
      thisArg = {};
    for(var sid in values) {
      fn.call(thisArg, [keys[sid], values[sid]]);
    }
  }

  return map;
}

S.wait = function(func, time) {
  setTimeout(func, time);
}