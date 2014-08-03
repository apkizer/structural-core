S.method('array', 'sort', function(kind){
	// insertion sort
	for(var i = 0; i < this.getLength(); i++) {
	    this('j', i);  
	    while(this('j') > 0 && this.getItem(this('j') - 1) > this.getItem(this('j'))) {
	        //swap:
	        this.log('swapping');
	        this('temp', this.getItem(this('j')));
	        this.setItem(this('j'), this.getItem(this('j') - 1));
	        this.setItem(this('j') - 1, this('temp'));
	        this('swapped', true);
	        this('j', this('j') - 1);
	    }
	    this.range(0, i, 1); //show sorted portion of array
	}
	this.clearfocus();
	this.clearrange(1);
});