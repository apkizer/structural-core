if(!S) console.log('S is not defined.');
if(!S.ee) console.log('S is not defined.');

S.base = function(view) {
  var c = S.ee();//{};
  c.live = {};
  c.algo = {};
  if(view) {
    c.view = view;
    view.component = c;
  }
  //var vars = {}; TODO move to base algo

  c.structureName = 'general';

  c.setView = function(view) {
    c.view = view;
    view.setComponent(c);
  }

  c.copy = function(other) {
    c.setState(other.getState());
  };

  c.getState = function() {
    console.log('getState not implemented!');
  };

  c.setState = function(state) {
    console.log('setState not implemented!');
  };

  // TODO these should all be moved to algo:
  /*c.live.set = function(key, value) {
    console.log('set is called! setting ' + key + ' to ' + value);
    vars[key] = value;
  }

  c.live.get = function(key) {
    console.log('get is called! value of ' + key + ' is ' + vars[key]);
    return vars[key];
  }

  c.live.is = function(key, value) {
    return vars[key] === value;
  }

  c.live.flog = function(str) {
    console.log(str);
  }*/

  c.algorithm = function(name, fn) {
    //c.algo[name] todo
  }

  return c;
}