S.baseView = function() {
  var v = S.ee(),
    _speed = 0;
  
  v.config = {};
  v.$element = $('<div></div>').addClass(S.config.viewClass);
  
  
  // initialization logic. called by component on set.
  v.init = function() {
    
  }
  
  // render logic. should (re)render and return handle to jQuery element.
  v.render = function() {
    
  }
  
  // set config
  v.config = function(options) {
    $.extend(v.config, options);
  }
    
  v.speed = function(speed) {
    if(!speed)
      return _speed;
    var spd = Math.min(5, Math.max(1, speed)); // 1 <= speed <= 5
    _speed = spd;
  }

  return v;
}