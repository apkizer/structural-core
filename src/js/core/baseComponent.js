S.base = function(view) {
  var c = S.ee();
  c.live = {};

  if(view) c.setView(view);

  c.setView = function(view) {
    c.view = view;
    view.component = c;
  }

  c.copy = function(other) {
    //c.setState(other.getState());
  };
    
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
  
  c.initDeferred = function() {
      c.def = S.deferred();
      c.def.wrap(c);
      c.deferredContext = c.def.getContext();
  }
  
  return c;
}