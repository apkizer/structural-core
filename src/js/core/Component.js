S.Component = function (state, view) {
    if (state)
        this.state = state;
    if (view)
        this.view = view;
};

S.Component.prototype = Object.create(S.EventEmitter.prototype);

Object.defineProperty(S.Component.prototype, 'state', {
    get: function () {
        var val;
        if(this.onGetState)
            val = this.onGetState(this._state) || this._state;
        return val;
    },
    set: function (state) {
        var val;
        if (this.onSetState)
            val = this.onSetState(state) || state;
        this._state = val;
    }
});

Object.defineProperty(S.Component.prototype, 'view', {
    get: function () {
        return this._view;
    },
    set: function (view) {
        this._view = view;
        view.component = this;
        view.init();
    }
});

S.Component.prototype.init = function () {
}
