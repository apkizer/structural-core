S.Array = (function () {

    function Array(state, view) {
        this.alias = 'array';
        S.Component.call(this, [].concat(state), view);
        this.state.flags = [];
    }

    Array.prototype = Object.create(S.Component.prototype);
    Array.prototype.constructor = Array;

    // sync only
    Array.prototype.getLength = function (next) {
        if (this.view)
            next(this.state.length);
        else
            return this.state.length;
    };
    Array.prototype.getLength.live = true;

    Array.prototype.flag = function (index, next) {
        this.state.flags[index] = true;
        if (this.view)
            this.view.flag(index, next);
    };
    Array.prototype.flag.live = true;

    Array.prototype.flagged = function (index, next) {
        if (this.view)
            next(this.state.length);
        else
            return this.state.flags[index];
    };
    Array.prototype.flagged.true;

    Array.prototype.setItem = function (index, value, next) {
        this.state[index] = value;
        if (this.view)
            this.view.setItem(index, value, next);
    };
    Array.prototype.setItem.live = true;

    Array.prototype.getItem = function (index, next) {
        if (this.view)
            next(this.state[index]);
        else
            return this.state[index];
    };
    Array.prototype.getItem.live = true;

    Array.prototype.push = function (item, next) {
        this.state.push(item);
        if (this.view)
            this.view.push(item, next);
    };
    Array.prototype.push.live = true;

    Array.prototype.focus = function (index, next) {
        if (this.view) this.view.focus(index, next);
    };
    Array.prototype.focus.live = true;

    Array.prototype.range = function (start, end, num, next) {
        if (this.view) this.view.range(start, end, num, next);
    };
    Array.prototype.range.live = true;

    Array.prototype.clearfocus = function (next) {
        if (this.view) this.view.clearfocus(next);
    };
    Array.prototype.clearfocus.live = true;

    Array.prototype.clearrange = function (num, next) {
        if (this.view) this.view.clearrange(num, next);
    };
    Array.prototype.clearrange.live = true;

    Array.prototype.leftTo = function (index, next) {
        if (this.view) this.view.leftTo(index, next);
    };
    Array.prototype.leftTo.live = true;


    return Array;

})();