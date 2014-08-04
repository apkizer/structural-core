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
    
    function search(left, right) {
        if(right < left) {
            this.finish();
            return;
        }
        this.clearrange(1);
        this.range(left, right, 1);
        var mid = (left + right) / 2;
        this.focus( Math.round(mid));
        if(target < this.getItem(mid)) {
            search.call(this, left, mid - 1);
        } else if(target > this.getItem(mid)) {
            search.call(this, mid + 1, right);
        } else {
            this.flag(mid); // TODO this causes error
            return;
        }
    }
    
    search.call(this, 0, this.getLength());
    
});
