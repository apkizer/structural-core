S.method('tree', 'finish', function() {
  this.clearFocus();
});

S.method('tree', 'buildBST', function() {
  this.clear();
  this.setNode(this.root(), 12);
  this('left', this.add(this.root(), false, 6));
  this('right', this.add(this.root(), true, 13));
  this.add(this('left'), false, 4);
  this.add(this('right'), true, 14);
});