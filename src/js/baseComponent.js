S.base = function(view) {
  var c = S.ee();
  c.live = {};
  c.algo = {};
  c.factory = {};
  if(view) {
    c.view = view;
    view.component = c;
  }

  c.structureName = 'general';

  c.setView = function(view) {
    c.view = view;
    view.setComponent(c);
  }

  c.copy = function(other) {
    //c.setState(other.getState());
  };
    
  c.getFactory = function() {
    console.log('getState not implemented!');
  }

  c.getState = function() {
    console.log('getState not implemented!');
  };

  c.setState = function(state) {
    console.log('setState not implemented!');
  };

  // wrappable interface:

  c.getSync = function() {
    return c.live;
  }

  c.getAsync = function() {
    return c.view;
  }
  
  c.makeDeferred = function() {
      c.def = S.deferred();
      //c.def.wrap(c);
      //c.deferredContext = c.def.getContext();
  }
  
  return c;
}