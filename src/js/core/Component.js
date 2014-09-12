S.Component = (function() {
  function Component(state, view) {
    if(state)
      this.state = state;
    if(view)
      this.view = view;
  }

  Component.prototype = Object.create(S.EventEmitter.prototype);

  Object.defineProperty(Component.prototype, 'state', {
    get: function() {
      return this._state;
    },
    set: function(state) {
      this._state = state;
    }
  });

  Object.defineProperty(Component.prototype, 'view', {
    get: function() {
      return this._view;
    },
    set: function(view) {
      this._view = view;
      view.component = this;
      view.init();
    }
  });

  Component.prototype.getSync = function() {
    return this.live;
  };

  Component.prototype.getAsync = function() {
    return this.view.live;
  };

  Component.prototype.getMethods = function() {
    return S.getComponentMethods(this.alias);
  };

  return Component;
})();