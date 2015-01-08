(function (mount) {
    "use strict";
    var S = mount.S = {};

    S.Component = function (state, view) {
        this.state = state;
        if (view) {
            this.view = view;
        }
    };
    S.Component.prototype.constructor = S.Component;

    S.View = function ($element) {
        this.$element = $element;
    };
    S.View.prototype.constructor = S.View;

    S.deepCopy = function (object) {
        return JSON.parse(JSON.stringify(object));
    };
})(window);

