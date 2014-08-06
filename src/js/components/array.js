(function(S){
  
    function array(arr) {
      var c = S.base(),
        flags = [];
      if(arr) 
        c.array = arr;

      c.copy = function() {
          return array(c.array.slice(0)); // by value copy
      }

      c.live.focus = null;
      c.live.range = null;
      c.live.clearfocus = null;
      c.live.clearrange = null;
      c.live.leftTo = null;

      c.live.getLength = function() {
        return c.array.length;
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
        console.log('pushing ' + item + ' in array.js');
        c.array.push(item);
      }

      c.getMethods = function() {
        return S.getComponentMethods('array');
      }

      return c;
    }
    S.component('array', array, {
      name: 'Array',
      desc: 'A standard array.'
    });
})(window.S);

