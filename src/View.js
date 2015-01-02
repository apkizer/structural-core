S.View = function (state, element) {
    this.$element = element instanceof jQuery ? element : jQuery(element);
    this.state = state;
    this.interactive = true;
};

S.View.prototype = Object.create(S.EventEmitter.prototype);
S.View.prototype.constructor = S.View;

S.View.prototype.onResize = function () {

};

S.View.prototype.clear = function () {
    this.$element.empty();
};

S.View.prototype.enableInteractivity = function () {
    this.interactive = true;
};

S.View.prototype.disableInteractivity = function () {
    this.interactive = false;
};
