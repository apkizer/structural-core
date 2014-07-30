window.S = (function($) {
  var S = {};
  S.components = {};
  S.views = {};
  var id = 0;
    
  S.components.getFactory = function(name) {
      if(S.components[name])
        return S.components[name].factory;
  }
  
  S.config = {
      viewClass: 'sview'
  };

  S.wait = function(func, time) {
      setTimeout(func, time);
  }
  
  if(!$)
    console.log('jQuery is missing.');

  S.add = function(name, func) {
    func.factory = func; // so that livewrap can copy   
    console.log('func.factory is ' + func.factory);
      
    // add in queue, rewrite methods
   /* var actualFunc = function() {
        var c = {};
        c = func.apply(this, arguments);
    }*/
    
      
    S.components[name] = func;
  }

  S.addView = function(component, name, func) {
    if(!S.views[component])
      S.views[component] = {};
    S.views[component][name] = func;
  }

  /*S.simpleWrappable = function() {
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
  }*/

  S.nextId = function() {
    return 'sid_' + id++;
  }

  S.map = function() {
    var _map = {},
      map = function(key, value) {
      console.log('attempting to store ' + key.sid);
      if(!key.sid)
        throw new Error('S.map() requires sid property. Use S.nextId().');
      if(typeof value === 'undefined') {
        return _map[key.sid];
      }
      _map[key.sid] = value;
    };

    map.clear = function() {
      _map = {};
    };

    map.delete = function(key) {
      if(!key.sid)
        throw new Error('S.map() requires sid property. Use S.nextId().');
      delete _map[key.sid];
    };

    map.has = function(key) {
      if(!key.sid)
        throw new Error('S.map() requires sid property. Use S.nextId().');
      return typeof _map[key.sid] !== 'undefined';
    }

    map.forEach = function(fn, thisArg) {
      if(!thisArg)
        thisArg = {};
      for(var key in _map) {
        fn.call(thisArg, [key, _map[key]]);
      }
    }

    return map;
  }
  return S;
})(jQuery);