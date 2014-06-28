window.S = (function($) {
  var S = {};
  S.components = {};
  S.views = {};

  S.wait = setTimeout;
  if(!$)
    console.log('jQuery is missing.');

  S.add = function(name, func) {
    S.components[name] = func;
  }

  S.addView = function(component, name, func) {
    if(!S.views[component])
      S.views[component] = {};
    S.views[component][name] = func;
  }

  S.simpleWrappable = function() {
    var wrappable = {
      live: {},
      async: {}
    };
    wrappable.getSync = function() {
      return wrappable.live;
    }
    wrappable.getAsync = function() {
      return wrappable.async;
    }
    return wrappable;
  }
  return S;
})(jQuery);