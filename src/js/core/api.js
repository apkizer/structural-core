S.component = function(name, factory, meta) {
  S.defineComponent(name, factory);
  if(meta)
    S.setMetaData(name, meta);
}

S.method = function(componentName, methodName, func) {
  // TODO
  S.defineMethodOn(componentName, methodName, func);
};

