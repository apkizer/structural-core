(function(S){
function array(arr, view) {
    var c = S.base(view),
      flags = [];
    c.array = arr;

    c.live.focus = null; // informs livewrap that this method only makes sense async
    c.live.range = null;
    c.live.clearfocus = null;
    c.live.clearrange = null;
    c.live.leftTo = null;

    c.copy = function() {
        return array(c.array, view);
    }

    c.live.getLength = function() {
      return c.array.length;
    }

    c.live.test = function() {
      return 9;
    }

    c.live.flag = function(index) {
      flags[index] = true;
    }

    c.live.isFlagged = function(index) {
      return !!flags[index];
    }

    c.live.setItem = function(index, value) {
      c.array[index] = value;
    }

    c.live.getItem = function(index) {
      return c.array[index];
    }

    c.live.push = function(item) {
      c.array.push(item);
    }
    
    c.makeDeferred();
    return c;
}
S.add('array', array);
})(window.S);

