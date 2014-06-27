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
  return S;
})(jQuery);