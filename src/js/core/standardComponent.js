S.simpleWrappable = function() {
  var wrappable = {
    live: {},
    async: {}
  };

  wrappable.noCopy = true;

  wrappable.getSync = function() {
    return wrappable.live;
  }

  wrappable.getAsync = function() {
    return wrappable.async;
  }

  return wrappable;
}

S.defineComponent('std', function() {
  var std = S.simpleWrappable(),
      vars = {};

  std.live.set = function(key, value) {
    vars[key] = value;
  }

  std.live.get = function(key) {
    return vars[key];
  }

  std.live.is = function(key, value) {
    return vars[key] === value;
  }

  std.live.log = function(str) {
    console.log(str);
  }

  std.live.flog = null;

  std.live.falert = null;

  std.async.falert = function(str, fn) {
    window.alert(str);
    fn();
  }

  std.async.flog = function(str, fn) {
    console.log(str);
    fn();
  }

  return std;
}, true);