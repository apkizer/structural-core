(function(){

  function Array(state, view) {
    //this.live.component = this;
    this.alias = 'array';
    S.Component.call(this, state, view);
    this.state.flags = [];
  }

  Array.prototype = Object.create(S.Component.prototype);
  Array.prototype.constructor = Array;
  Array.prototype.live = {};

  Array.prototype.live.getLength = function() {
    return this.state.length;
  };

  Array.prototype.live.flag = function(index) {
    this.state.flags[index] = true;
  };

  Array.prototype.live.flagged = function(index) {
    return this.state.flags[index];
  };

  Array.prototype.live.setItem = function(index, value) {
    this.state[index] = value;
  };

  Array.prototype.live.getItem = function(index) {
    return this.state[index];
  };

  Array.prototype.live.push = function(item) {
    this.state.push(item);
  }

  Array.prototype.live.focus = null;

  Array.prototype.live.range = null;

  Array.prototype.live.range = null;

  Array.prototype.live.clearfocus = null;

  Array.prototype.live.clearrange = null;

  Array.prototype.live.leftTo = null;

  S.defineComponent2('array2', Array);

})();