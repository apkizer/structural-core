S.components = {};
S.views = {};
var id = 0,
    componentMethods = {};

/**
 * Registers a component.
 * @param name The name of the component.
 * @param factoryFunction A function which returns new instances of the component.
 */
S.defineComponent = function(name, factoryFunction) {

}

S.defineMethodOn = function(name, func) {

}

S.defineStandaloneMethod = function(requirements, func) {

}

/**
 * Generates default deferred execution contexts on all registered components.
 */
S.generateDefaultExecutionContexts = function() {

}


S.add = function(name, func) {
    S.components[name] = func;
}

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