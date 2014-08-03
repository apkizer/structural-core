S.base = function(name, view) {
  var base = S.ee();
  base.name = name;
  base.live = {};

  if(view) base.setView(view);

  base.setView = function(view) {
    base.view = view;
    view.component = base;
  }

  base.copy = function(other) {
    //c.setState(other.getState());
  };
    
  base.getState = function() {
    console.log('getState not implemented!');
  };

  base.setState = function(state) {
    console.log('setState not implemented!');
  };

  // wrappable interface:
  base.getSync = function() {
    return base.live;
  }

  base.getAsync = function() {
    return base.view;
  }

  base.getMethods = function() {
    return S.getComponentMethods(base.name);
  }
  
  return base;
}