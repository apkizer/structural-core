S.view = function() {
  var v = S.ee();
    //_speed = 0;

  v.$element = $('<div></div>').addClass(S.config.viewClass);
    
  /*v.speed = function(speed) {
    if(!speed)
      return _speed;
    var spd = Math.min(5, Math.max(1, speed)); // 1 <= speed <= 5
    _speed = spd;
  }*/

  return v;
}