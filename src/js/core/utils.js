var id = 0;

/**
 * Shallow extend utility.
 */
S.extend = function () {
    var args = Array.prototype.slice.call(arguments),
        ret = {};
    args.forEach(function (mixin) {
        for (var property in mixin) {
            if (!mixin.hasOwnProperty(property)) continue;
            ret[property] = mixin[property];
        }
    });
    return ret;
}

S.nextId = function () {
    return 'id_' + id++;
}

S.map = function () {
    var values = {},
        keys = {},
        map = function (key, value) {
            if (!key.id)
                throw new Error('S.map() requires id property. Use S.nextId().');
            if (typeof value === 'undefined') {
                if (!values[key.id])
                    values[key.id] = {};
                return values[key.id];
            }
            values[key.id] = value;
            keys[key.id] = key;
        };

    map.clear = function () {
        values = {};
        keys = {};
    };

    map.delete = function (key) {
        if (!key.id)
            throw new Error('S.map() requires id property. Use S.nextId().');
        delete values[key.id];
    };

    map.has = function (key) {
        if (!key.id)
            throw new Error('S.map() requires id property. Use S.nextId().');
        return typeof values[key.id] !== 'undefined';
    }

    map.forEach = function (fn, thisArg) {
        if (!thisArg)
            thisArg = {};
        for (var id in values) {
            fn.call(thisArg, [keys[id], values[id]]);
        }
    }

    return map;
}

S.wait = function (func, time) {
    setTimeout(func, time);
}