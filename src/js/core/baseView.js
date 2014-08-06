S.baseView = function() {
  var v = S.ee(),
    _speed = 0;
  
  v._config = {};
  v.$element = $('<div></div>').addClass(S.config.viewClass);
  
  
  // initialization logic. called by component on set.
  v.init = function() {
    
  }
  
  // render logic. should (re)render and return handle to jQuery element.
  // 1. clear everything inside the view.$element element.
  // 2. (re)render
  v.render = function() {
    
  }
  
  // should scale the view to the appropriate dimensions. outer wrap element must be width and height specified.
  v.scaleTo = function(dimensions) {
    v.$element.width(dimensions.width);
    v.$element.height(dimensions.height);
  }
  
  // set config
  // - should only be used by users & init
  v.config = function(options) {
    if(!options) 
      return v._config;
    $.extend(v._config, options);
  }
    
  v.speed = function(speed) {
    if(!speed)
      return _speed;
    var spd = Math.min(5, Math.max(1, speed)); // 1 <= speed <= 5
    _speed = spd;
  }

  return v;
}