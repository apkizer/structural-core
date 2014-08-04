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

S.method('array', 'isSorted', function() {
    for(var i = 1; i < this.getLength(); i++) {
        if(this.getItem(i) < this.getItem(i - 1))
            return false;
    }
    return true;
});
