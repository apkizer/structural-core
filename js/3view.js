if(!S) console.log('S is not defined.')
if(!S.ee) console.log('S is not defined.')

S.view = function() {
  var v = S.ee(),
    _speed = 0;

  v.speed = function(speed) {
    if(!speed)
      return _speed;
    var spd = Math.min(5, Math.max(1, speed)); // 1 <= speed <= 5
    _speed = spd;
  }



  return v;
}