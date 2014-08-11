S.Component = (function() {

  function Component(name, view) {
    this.name = name;
    this.live = {};
    if(view)
      this.setView(view);
  }

  Component.prototype = Object.create(S.EventEmitter.prototype);

  Component.prototype.setView = function(view) {
    this.view = view;
    view.component = this;
    view.init();
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


S.base = function(name, view) {
  var base = new S.EventEmitter(); //S.ee();
  base.name = name;
  base.live = {};
  base.representation = {};

  if(view) base.setView(view);

  base.setView = function(view) {
    console.log('setView');
    base.view = view;
    view.component = base;
    view.init(); 
  }
  
  base.copy = function(other) {
    //c.setState(other.getState());
  };

  /**
   * Serializes state to an object.
   */
  base.serialize = function() {

  }

  /**
   * Data is an object representing saved object's state.
   * @param data
   */
  base.deserialize = function(data) {
    
  }

  /**
   * Returns the template for configuration for this component.
   * E.g.
   * {
   *  foo: 'boolean',
   *  bar: 'integer',
   *  abc: 'string',
   *  def: 'number'
   * }
   */
  base.getConfigTemplate = function() {

  }

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
    return base.view.live;
    //return base.representation;
  }

  base.getMethods = function() {
    return S.getComponentMethods(base.name);
  }
  
  return base;
}