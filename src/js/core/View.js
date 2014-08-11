S.View = (function($){

  function View() {
    this.live = {};
    this._speed = 0;
    this._config = {};
    this.$element = $('<div></div>').addClass(S.config.viewClass);
  }

  View.prototype = Object.create(S.EventEmitter.prototype);

  View.prototype.init = function() {
    //
  }

  View.prototype.render = function() {
    //
  }

  View.prototype.scaleTo = function(dimensions) {
    this.$element.width(dimensions.width);
    this.$element.height(dimensions.height);
  }

  Object.defineProperty(View.prototype, 'config', {
    get: function() {
      return this._config;
    },
    set: function(options) {
      $.extend(this._config, options);
    }
  });

  View.prototype.speed = function() {
    // TODO
  }

  /*
   v.speed = function(speed) {
   if(!speed)
   return _speed;
   var spd = Math.min(5, Math.max(1, speed)); // 1 <= speed <= 5
   _speed = spd;
   }
   */

  return View;
})(jQuery);

