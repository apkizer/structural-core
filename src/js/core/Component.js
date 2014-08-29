S.Component = (function() {

  function Component(name, view, state) {
    console.info('Component being created. name is %s. view is %s. state is %s', name, view, state);
    this.name = name;
    //this.live = {};
    this.state = state;
    if(view)
      this.setView(view);
  }

  Component.prototype = Object.create(S.EventEmitter.prototype);
  
  Component.prototype.live = {};

  Component.prototype.setView = function(view) {
    this.view = view;
    view.component = this;
    view.init();
  }
  
  Component.prototype.getState = function() {
    return this.state;
  }

  Component.prototype.copy = function() {
    //
  }

  Component.prototype.serialize = function() {
    //
  }

  Component.prototype.deserialize = function() {
    //
  }

  Component.prototype.getConfigTemplate = function() {
  
  }

  // wrappable:

  Component.prototype.getSync = function() {
    return this.live;
  }

  Component.prototype.getAsync = function() {
    return this.view.live;
  }

  Component.prototype.getMethods = function() {
    return S.getComponentMethods(this.name);
  }

  return Component;
  
})();


