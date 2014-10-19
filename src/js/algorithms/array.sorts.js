S.method(function (array) {
    for (var i = 0; i < array.getLength(); i++) {
        this('j', i);
        while (this('j') > 0 && array.getItem(this('j') - 1) > array.getItem(this('j'))) {
            this('temp', array.getItem(this('j')));
            array.setItem(this('j'), array.getItem(this('j') - 1));
            array.setItem(this('j') - 1, this('temp'));
            this('swapped', true);
            this('j', this('j') - 1);
        }
        array.range(0, i, 1); //show sorted portion of array
    }
    array.clearrange(1);
    //this.finish();
}, 'insertionSort', 'array');

/*S.method('array', 'bubbleSort', function () {
    this('swap', true);
    while (this.is('swap', true)) {
        this('swap', false);
        for (var i = 0; i < this.getLength() - 1; i++) {
            this.focus(i);
            if (this.getItem(i) > this.getItem(i + 1)) {
                // swap
                this.range(i, i + 1, 2);
                /*this('temp', this.getItem(i));
                 this.setItem(i, this.getItem(i + 1));
                 this.setItem(i + 1, this('temp'));*/
                /*this.swap(i, i + 1);
                this('swap', true);
                this.clearrange(2);
            }
        }
    }
    this.finish();
});

S.method('array', 'quickSort', function () {
    // TODO
});*/