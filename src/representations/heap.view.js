S.HeapView = (function () {

    function HeapView (state, element) {
        S.View.call(this, state, element);
        this.$element.append($('<div class="heap-tree" style="height: 75%;"></div>'));
        this.$element.append($('<div class="heap-array" style="height: 25%;"></div>'));
        this.treeElement = this.$element.find('.heap-tree');
        this.arrayElement = this.$element.find('.heap-array');
        this.treeView = new S.TreeView(null, this.treeElement);
        this.arrayView = new S.ArrayView(null, this.arrayElement);
        this.treeView.options.autoScaleOptions.scaleY = .2;
    };

    HeapView.prototype = Object.create(S.View.prototype);
    HeapView.prototype.constructor = HeapView;

    HeapView.prototype.init = function () {

    };

    HeapView.prototype.onResize = function () {
        this.treeView.onResize();
        this.arrayView.render();
    };

    return HeapView;

})();