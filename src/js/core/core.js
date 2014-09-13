S.VIEW_CLASS = 'structural_view';
S.components = {};
S.views = {};

var components = {},
    componentMethods = {},
    standaloneMethods = {},
    componentMeta = {};

/**
 * Registers a component.
 * @param name The name of the component.
 * @param factoryFunction A function which returns new instances of the component.
 * @param noDefault If true, Structural does not provide a default deferred execution context on instances of this component.
 */
S.defineComponent = function(name, factoryFunction, noDefault) {
    components[name] = factoryFunction;
    /* middleware & default deferred context */
    S.components[name] = function() {
      var component = components[name].apply(this, arguments);
      // provide default deferred context
      if(S.config.provideDefaultDeferredContext && !noDefault) {
        provideDefaultDeferredContext(component);
      }
      // give default view
      if(S.views[name]) {
        console.log('setting view ' + name);
        component.view = S.views[name]();
      }
      // initialize component
      if(component.init) component.init();
      return component;
    }
}

S.defineComponent2 = function(name, ctor, noDefault) {
  components[name] = ctor;
  S.components[name] = function(state, view) {
    var component = new components[name](state, view);

    if(S.config.provideDefaultDeferredContext && !noDefault) {
      provideDefaultDeferredContext(component);
    }

    if(S.views[name]) {
      component.view = S.views[name]();
    }

    //if(component.init) component.init();

    return component;
  }
}

S.defineMethodOn = function(name, methodName, func) {
  if(!componentMethods[name])
    componentMethods[name] = {};
  componentMethods[name][methodName] = func;
}

S.defineStandaloneMethod = function(requirements, optionalRequirements, func) {
  if(!standaloneMethods[name])
    standaloneMethods[name] = {};
  standaloneMethods[name].requirements = requirements;
  standaloneMethods[name].optionalRequirements = optionalRequirements;
  standaloneMethods[name][methodName] = func;
}

S.setMetaData = function(name, meta) {
  componentMeta[name] = meta;
}

function provideDefaultDeferredContext(component) {
  /*component.def = new S.Deferred(); //S.deferred();
  component.def.wrap(component);
  component.deferredContext = component.def.getContext();       */
}

S.setDefaultView = function(name, factory) {
    S.views[name] = factory;
}

/*S.addView = function(component, name, func) {
    if(!S.views[component])
      S.views[component] = {};
    S.views[component][name] = func;
}*/

S.addMethod = function(componentName, methodName, func) {
  if(!componentMethods[componentName])
    componentMethods[componentName] = {};
  componentMethods[componentName][methodName] = func;
}

S.getComponentMethods = function(componentName) {
  return componentMethods[componentName];
}