S.Array = function (state, view) {
    S.Component.call(this, state, view);
}

S.Array.prototype = Object.create(S.Component.prototype);
S.Array.prototype.constructor = S.Array;

S.Array.prototype.makeState = function (array) {
    return {
        array: array
    };
};

S.Array.prototype.setValue = function (index, value, callback) {
    this.state.array[index] = value;
    if (this.view) {
        this.view.setItem(index, value, callback);
    }
};

S.Array.prototype.getValue = function (index, callback) {
    if (this.view) {
        next(this.state.array[index]);
    } else {
        return this.state.array[index];
    }
};

S.Array.prototype.getLength = function (callback) {
    if (this.view) {
        next(this.state.array.length);
    } else {
        return this.state.array.length;
    }
};

S.Array.prototype.push = function (value, callback) {
    this.state.array.push(value);
    if (this.view) {
        this.view.push(value, callback);
    }
};
