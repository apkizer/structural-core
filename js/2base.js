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

  return c;
}