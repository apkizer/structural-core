if(!S) console.log('S is not defined.')
if(!S.ee) console.log('S is not defined.')

S.view = function() {
  var v = S.ee(),
    _speed = 0;

  v.$e = $('<div class="sview"></div>');

  v.speed = function(speed) {
    if(!speed)
      return _speed;
    var spd = Math.min(5, Math.max(1, speed)); // 1 <= speed <= 5
    _speed = spd;
  }

  v.focus = function() {
    // focus
    console.log('focus?')
    if(v.$e) {
      v.$e.css('border', '2px solid blue');
      console.log('focused');
    }
  }

  v.unfocus = function() {
    if(v.$e)
      v.$e.css('box-shadow', 'none');
  }

  return v;
}