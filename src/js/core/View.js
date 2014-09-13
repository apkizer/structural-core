S.View = (function($){
  function View() {
    //this.live = {}; // TODO delete
    this._config = {};
    this.$element = $('<div>').addClass(S.VIEW_CLASS);
  }

  View.prototype = Object.create(S.EventEmitter.prototype); 

  View.prototype.init = function() { };

  View.prototype.render = function() { };

  // TODO remove scaleTo:
  View.prototype.scaleTo = function(dimensions) {
    this.$element.width(dimensions.width);
    this.$element.height(dimensions.height);
  };

  // TODO keep this:
  /**
   * Adjusts the View's drawing parameters based on `dimensions`.
   * @param dimensions An object containing `width` and `height` properties.
   */
  View.prototype.scale = function(dimensions) {
    this.$element.width(dimensions.width);
    this.$element.height(dimensions.height);
  };

  View.prototype.clear = function() {
    this.$element.empty();
  };

  Object.defineProperty(View.prototype, 'config', {
    get: function() {
      return this._config;
    },
    set: function(options) {
      $.extend(this._config, options);
    }
  });

  return View;
})(jQuery);

