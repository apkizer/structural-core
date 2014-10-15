S.Component = function (state, view) {
    console.info('Component constructor');
    if (state)
        this.state = state;
    if (view)
        this.view = view;
};

S.Component.prototype = Object.create(S.EventEmitter.prototype);

Object.defineProperty(S.Component.prototype, 'state', {
    get: function () {
        var ret;
        if(this.prepareState)
            ret = this.prepareState(this._state) || this._state;
        return ret;
    },
    set: function (state) {
        var toSet;
        if (this.handleState)
            toSet = this.handleState(state) || state;
        this._state = toSet;
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

/**
 * Convenience method. Makes all properties set to null on this.live view-only methods.
 */
// TODO
S.Component.prototype.makeViewOnly = function () {
    for (var property in this.live) {
        if (this.live.hasOwnProperty(property) && property === null) {
            this.live[property] = (function (property) {
                var fn = function () {
                    this.view.live[property].apply(this.view.live, Array.prototype.slice.call(arguments));
                };
            })(property);
        }
    }
};

S.Component.prototype.bindLive = function () {
    for (var property in this.live) {
        if (!this.live.hasOwnProperty(property) || typeof this.live[property] !== 'function')
            continue;
        this.live[property].bind(this);
    }
};

S.Component.prototype.init = function () {
    // this.makeViewOnly(); // TODO
    // this.bindLive(); // TODO
}