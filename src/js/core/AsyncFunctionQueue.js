function AsyncFunctionQueue() {
  this.queue = []; // the array of functions.
  this.position = 0; // the last function executed. -1 if no functions have been executed.
  this.sleep = 0; // the time to wait between executing functions after `exec` is called.
  this.states = []; //

}

/**
 * Pushes a function to the queue.
 * @param fn This should accept a callback as its last parameter.
 */
AsyncFunctionQueue.prototype.push = function(fn) {
  this.queue.push(fn);
}

/**
 * Clears all functions and sets `position` to 0.
 */
AsyncFunctionQueue.prototype.clear = function() {
  this.queue = [];
  this.last = -1;
}

/**
 * Executes the next function and increments `position` on its completion.
 */
AsyncFunctionQueue.prototype.next = function() {

}

/**
 * Begins executing all functions starting with the next function.
 */
AsyncFunctionQueue.prototype.exec = function() {

}

/**
 * Enables auto execution. Functions are run as they are pushed.
 */
AsyncFunctionQueue.prototype.open = function() {

}

/**
 * Disables auto execution. Function "pile up".
 */
AsyncFunctionQueue.prototype.close = function() {

}

Object.defineProperty(AsyncFunctionQueue.prototype, 'length', {
  get: function() {
    return this.queue.length;
  }
});

Object.defineProperty(AsyncFunctionQueue.prototype, 'completion', {
  get: function() {
    return this.position / this.queue.length;
  }
});



