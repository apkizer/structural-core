S.method('array', 'finish', function(){
  this.clearfocus();
  this.leftTo(0);
})

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