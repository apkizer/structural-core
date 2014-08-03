S.components = {};
S.views = {};
var components = {},
    componentMethods = {},
    standaloneMethods = {};

/**
 * Registers a component.
 * @param name The name of the component.
 * @param factoryFunction A function which returns new instances of the component.
 */
S.defineComponent = function(name, factoryFunction) {
  components[name] = factoryFunction;
  /* default deferred context */
  if(S.config.provideDefaultDeferredContext) {

  }
  S.components[name] = function() {
    console.log('adding default deferred context to ' + name);
    var component = components[name].apply(this, arguments);
    provideDefaultDeferredContext(component);
    return component;
  }

}

S.defineMethodOn = function(name, methodName, func) {
  if(!componentMethods[name])
    componentMethods[name] = {};
  componentMethods[name][methodName] = func;
}

S.defineStandaloneMethod = function(requirements, func) {
  if(!standaloneMethods[name])
    standaloneMethods[name] = {};
  standaloneMethods[name].requirements = requirements;
  standaloneMethods[name][methodName] = func;
}

function provideDefaultDeferredContext(component) {
  component.def = S.deferred();
  component.def.wrap(component);
  component.deferredContext = component.def.getContext();
}


/*S.add = function(name, func) {
    S.components[name] = func;
} */

S.addView = function(component, name, func) {
    if(!S.views[component])
      S.views[component] = {};
    S.views[component][name] = func;
}

S.addMethod = function(componentName, methodName, func) {
  if(!componentMethods[componentName])
    componentMethods[componentName] = {};
  componentMethods[componentName][methodName] = func;
}

S.getComponentMethods = function(componentName) {
  return componentMethods[componentName];
}