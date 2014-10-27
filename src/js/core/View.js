S.View = function (element) {
    this.$element = element instanceof jQuery ? element : jQuery(element);
    this.interactive = true;
};

S.View.prototype = Object.create(S.EventEmitter.prototype);

S.View.prototype.clear = function () {
    this.$element.empty();
};

S.View.prototype.enableInteractivity = function () {
    this.interactive = true;
};

S.View.prototype.disableInteractivity = function () {
    this.interactive = false;
};
