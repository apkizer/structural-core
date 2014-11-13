S.Component = function (state, view) {
    if (state) {
        this.state = state;
    }
    if (view) {
        this.view = view;
        this.view.state = this.state;
    }
};

S.Component.prototype = Object.create(S.EventEmitter.prototype);
S.Component.prototype.constructor = S.Component;

Object.defineProperty(S.Component.prototype, 'state', {
    get: function () {
        var val = this._state;
        if(this.onGetState)
            val = this.onGetState(val) || val;
        return val;
    },
    set: function (state) {
        var val = state;
        if (this.onSetState)
            val = this.onSetState(val) || val;
        this._state = val;
    }
});
