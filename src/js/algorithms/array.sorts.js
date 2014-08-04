S.method('array', 'insertionSort', function(){
	for(var i = 0; i < this.getLength(); i++) {
	    this('j', i);  
	    while(this('j') > 0 && this.getItem(this('j') - 1) > this.getItem(this('j'))) {
	        //swap:
	        /*this.log('swapping');
	        this('temp', this.getItem(this('j')));
	        this.setItem(this('j'), this.getItem(this('j') - 1));
	        this.setItem(this('j') - 1, this('temp'));*/
          this.swap(this('j'), this('j') - 1);
	        this('swapped', true);
	        this('j', this('j') - 1);
	    }
	    this.range(0, i, 1); //show sorted portion of array
	}
	this.clearrange(1);
  this.finish();
});

S.method('array', 'bubbleSort', function(){
  this('swap', true);
  while(this.is('swap', true)) {
    this('swap', false);
    for(var i = 0; i < this.getLength() - 1; i++) {
      this.focus(i);
      if( this.getItem(i) > this.getItem(i + 1) ) {
        // swap
        this.range(i, i+1, 2);
        /*this('temp', this.getItem(i));
        this.setItem(i, this.getItem(i + 1));
        this.setItem(i + 1, this('temp'));*/
        this.swap(i, i+1);
        this('swap', true);
        this.clearrange(2);
      }
    }
  }
  this.finish();
});

S.method('array', 'quickSort', function(){
  // TODO
});