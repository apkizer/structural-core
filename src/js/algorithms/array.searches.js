S.method('array', 'searchLinear', function (target) {
    for (var i = 0; i < this.getLength(); i++) {
        this.focus(i);
        if (this.getItem(i) == target) {
            this.flag(i);
            return;
        }
    }
    this.finish();
});

S.method('array', 'searchBinary', function (target) {

    if (!this.isSorted()) {
        this.warn('Array is not sorted. Binary search will not behave correctly.');
    }

    function search(left, right) {
        if (right < left) {
            this.clearrange(1);
            this.finish();
            return;
        }
        this.clearrange(1);
        this.range(left, right, 1);
        var mid = Math.floor((left + right) / 2);
        this.focus(mid);
        if (target < this.getItem(mid)) {
            search.call(this, left, mid - 1);
        } else if (target > this.getItem(mid)) {
            search.call(this, mid + 1, right);
        } else {
            this.focus(mid);
            this.flag(mid);
            return;
        }
    }

    search.call(this, 0, this.getLength());

});
