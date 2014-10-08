S.AsyncFunctionQueue = (function () {

    /**
     * Constructs a new Asynchronous Function Queue. This is a list of functions that run asynchronous code,
     * such as animating elements on the page or making ajax requests. Each function should accept the callback
     * parameter as its final parameter, and call this callback to signal the completion of the function.
     * @constructor
     */
    function AsyncFunctionQueue() {
        this.functionList = []; // the array of functions.
        this.position = 0; // the current function to be executed.
        this.sleep = 100; // the time to wait between executing functions after `exec` is called.
        this.states = []; //
        this._open = false; // If true, auto execution is enabled.
        this.clearOnFinish = true; // If true, clears `functionList` once the last function is executed.
        this.executing = false; // True while executing.
    }

    /**
     * Pushes a function to the queue. If auto execution is enabled, the function is called.
     * @param fn This should accept a callback as its last parameter.
     */
    AsyncFunctionQueue.prototype.push = function (fn) {
        this.functionList.push(fn);
        if (this._open && !this.executing) {
            this.exec();
        }
    }

    /**
     * Stops execution, clears all functions, and sets `position` to 0.
     */
    AsyncFunctionQueue.prototype.clear = function () {
        this.executing = false;
        this.functionList = [];
        this.position = 0;

    }

    /**
     * Executes the next function and increments `position` on its completion.
     */
    AsyncFunctionQueue.prototype.next = function (fn) {
        var self = this;
        // TODO bind self as this?
        this.functionList[this.position].call(self, function () {
            self.position++;
            fn();
        });
    }

    /**
     * Begins executing all functions starting with the next function.
     */
    AsyncFunctionQueue.prototype.exec = function () {
        console.groupCollapsed('AsyncFunctionQueue executing');
        this.executing = true;
        var self = this;

        function iteration() {
            if (self.position >= self.functionList.length && self.clearOnFinish) {
                self.clear();
            }
            if (self.position >= self.functionList.length || !self.executing || !self.functionList[self.position]) {
                self.executing = false;
                console.groupEnd();
                return;
            }
            self.next(function () {
                setTimeout(iteration, self.sleep);
            });
        }

        iteration();
    }

    /**
     * Pauses execution.
     */
    AsyncFunctionQueue.prototype.pause = function () {
        this.executing = false;
    }

    /**
     * Enables auto execution. Functions are run as they are pushed.
     */
    AsyncFunctionQueue.prototype.open = function () {
        this._open = true;
        this.exec();
    }

    /**
     * Disables auto execution and stops current execution. Function "pile up".
     */
    AsyncFunctionQueue.prototype.close = function () {
        this._open = false;
        this.executing = false;
    }

    /**
     * Returns the number of functions on the queue.
     */
    Object.defineProperty(AsyncFunctionQueue.prototype, 'length', {
        get: function () {
            return this.functionList.length;
        }
    });

    /**
     * Returns the number of current position / the number of functions on the queue.
     */
    Object.defineProperty(AsyncFunctionQueue.prototype, 'completion', {
        get: function () {
            return this.position / this.functionList.length;
        }
    });

    return AsyncFunctionQueue;

})();




