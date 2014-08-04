S.method('array', 'finish', function() {
  this.clearfocus();
  this.leftTo(0);
});

S.method('array', 'swap', function(a, b) {
  this.log('swapping');
  this('temp', this.getItem(a));
  this.setItem(a, this.getItem(b));
  this.setItem(b, this('temp'));
});

S.method('array', 'searchLinear', function(target) {
  for(var i = 0; i < this.getLength(); i++) {
    this.focus(i);
    if(this.getItem(i) == target) {
      this.flag(i);
      return;
    }
  }
  this.finish();
});

S.method('array', 'searchBinary', function(target) {
  // TODO
});

