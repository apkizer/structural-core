S.HeapView = (function () {

	function HeapView (element) {
		S.View.call(this, element);
		this.$element.append($('<div class="heap-tree" style="height: 75%;"></div>'));
		this.$element.append($('<div class="heap-array" style="height: 25%;"></div>'));
		this.treeElement = this.$element.find('.heap-tree');
		this.arrayElement = this.$element.find('.heap-array');
		this.treeView = new S.TreeView(this.treeElement);
		this.arrayView = new S.ArrayView(this.arrayElement);
	};

	HeapView.prototype = Object.create(S.View.prototype);
	HeapView.prototype.constructor = HeapView;

	HeapView.prototype.init = function () {

	};

	return HeapView;

})();