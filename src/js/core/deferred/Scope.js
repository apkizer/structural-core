S.Scope = (function() {

  function Scope(items) {
    this.queue = new S.AsyncFunctionQueue();
    this.interface = new S.DeferredInterface(this.queue);
    this.include(items);
  }

  Scope.prototype.include = function(items) {
    if(Array.isArray(items)) {
      items.forEach(this.interface.include);
    } else {
      this.interface.include(items);
    }
  };

  return Scope;

})();
