S.ArrayView = (function () {

    function ArrayView(state, element) {
        S.View.call(this, state, element);
        this.options = {
            hiddenDelimiter: ',',
            numElements: 5,
            pageTime: 300,
            stepTime: 50,
            scrollTime: 500,
            maxScrollTime: 1000
        };
        this.leftBound = 0;
        this.rightBound = this.options.numElements - 1;
        this.$e = null;
        this.$table = null;
        this.$topRow = null;
        this.$bottomRow = null;
        this.$cells = $();
        this.$indices = $();
        this.computedWidth = null;
        this.width = null;
        this.border = 0;
        this.computedCellWidth = null;
        this.height = null;
        this.$e = $('<div class="array"></div>');
        this.scaleTo({
            width: this.$element.width(),
            height: this.$element.height()
        });
        if(this.state)
            this.render();
    }

    ArrayView.prototype = Object.create(S.View.prototype);
    ArrayView.prototype.constructor = ArrayView;

    ArrayView.prototype.scaleTo = function (dimensions) {
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.$e.css('width', dimensions.width);
        this.$e.css('height', dimensions.height);
        this.computedCellWidth = Math.floor(this.width / this.options.numElements) - this.border;
    };

    ArrayView.prototype.render = function () {
        this.clear();
        this.$cells = $();
        this.$indices = $();
        this.$table = $('<table></table>').addClass('array-table');
        this.$topRow = $('<tr></tr>').addClass('array-top');
        this.$bottomRow = $('<tr></tr>').addClass('array-bottom');
        this.$e.append(this.$table);
        this.$table.append(this.$topRow).append(this.$bottomRow);

        this.$table.css({
            height: this.height
        });

        this.$topRow.css({
            fontSize: Math.round(this.$table.height() * .25)
        });

        for (var i = 0; i < this.state.array.length; i++) {
            var $td = $('<td>' + this.state.array[i] + '<span style="font-size: 0;">' + this.options.hiddenDelimiter + '</span></td>'),
                $th = $('<th>' + i + '</th>');
            $td.data('index', i);
            $th.data('index', i);
            $td.width(this.computedCellWidth);
            $th.width(this.computedCellWidth);
            $td.addClass('array-cell');
            $th.addClass('array-index');
            this.$topRow.append($td);
            this.$bottomRow.append($th);
            this.$cells = this.$cells.add($td);
            this.$indices = this.$indices.add($th);
        }

        this.computedWidth = this.computedCellWidth + this.border;
        this.width = this.options.numElements * this.computedWidth + this.border;
        this.$e.css('width', this.width); // TODO
        this.$element.append(this.$e);
        this.bindEvents(this.$cells, this.$indices);
    };

    ArrayView.prototype.bindEvents = function ($cells, $_indices) {
        //$e.mousewheel(handleMousewheel); // TODO needs mousewheel
        var self = this;
        this.$cells.click(function (e) {
            if (!self.interactive) return;
            self.focus($(this).data('index'));
        });
        this.$cells.dblclick(function (e) {
            if (!self.interactive) return;
            if ($(this).hasClass('array-flagged'))
                $(this).removeClass('array-flagged');
            else
                $(this).addClass('array-flagged');
        });
    };
    ArrayView.prototype.focus = function (index, fn) {
        if (index < 0 || index > this.state.array.length - 1)
            return;
        this.$cells.removeClass('focus');
        this.$indices.removeClass('focus');
        this.$cells.eq(index).addClass('focus');
        this.$indices.eq(index).addClass('focus');
        var idx = index - Math.floor(this.options.numElements / 2);
        this.leftTo(idx, fn);
    };
    ArrayView.prototype.focus.live = true;

    ArrayView.prototype.clearfocus = function (fn) {
        this.$cells.removeClass('focus');
        this.$indices.removeClass('focus');
        fn();
    }
    ArrayView.prototype.clearfocus.live = true;

    ArrayView.prototype.flag = function (index, fn) {
        this.$cells.eq(index).addClass('array-flagged');
        if (fn) fn();
    }
    ArrayView.prototype.flag.live = true;

    ArrayView.prototype.range = function (start, end, num, fn) {
        var $range = this.$cells.slice(start, end + 1),
            clazz = 'range' + num;
        // TODO why do I do this? -v
        $range.addClass(function (i) {
            var classes = $range.eq(i).attr('class'),
                newClass = clazz + ' ' + classes;
            $range.eq(i).attr('class', newClass);
        });
        fn();
    };
    ArrayView.prototype.range.live = true;

    ArrayView.prototype.clearrange = function (num, fn) {
        this.$cells.removeClass('range' + num);
        fn();
    };
    ArrayView.prototype.clearrange.live = true;

    ArrayView.prototype.setItem = function (index, item, fn) {
        var self = this;
        this.focus(index, function () {
            S.wait(function () {
                self.$cells.eq(index).addClass('array-remove');
                S.wait(function () {
                    self.$cells.eq(index).text(item);
                    self.$cells.eq(index).removeClass('array-remove');
                    fn();
                }, 300);
            }, 200);
        });
    };
    ArrayView.prototype.setItem.live = true;

    ArrayView.prototype.push = function (item, fn) {
        var $added = this.addItem(item, this.state.array.length - 1);
        this.leftTo(this.state.array.length - 1, function () {
            $added.animate({
                opacity: 1
            }, 200, function () {
                fn();
            });
        });
    };
    ArrayView.prototype.push.live = true;

    ArrayView.prototype.addItem = function (item, index) {
        var $newTd = $('<td>' + item + '</td>'),
            $newTh = $('<th>' + index + '</th>');
        var $both = $newTd.add($newTh).css({
            opacity: 0,
            width: this.computedCellWidth
        });
        $newTd.addClass('array-cell');
        $newTh.addClass('array-index');
        $both.data('index', index);
        this.$topRow.append($newTd);
        this.$bottomRow.append($newTh);
        this.$cells = this.$cells.add($newTd);
        this.$indices = this.$indices.add($newTh);
        this.bindEvents($newTd, $newTh);
        return $both;
    };

    ArrayView.prototype.leftTo = function (index, fn) {
        index = parseInt(index, 10);
        if (isNaN(index))
            return;
        if (index <= 0)
            index = 0;
        if (index >= this.state.array.length - 1)
            index = this.state.array.length - 1;
        var time = Math.min(Math.abs(index - this.leftBound) * this.options.stepTime, this.options.maxScrollTime);
        if (index == 0) {
            this.leftBound = 0;
            this.rightBound = this.options.numElements - 1;
        } else if (index > this.state.array.length - this.options.numElements) {
            this.leftBound = this.state.array.length - this.options.numElements;
            this.rightBound = this.state.array.length - 1;
        } else {
            this.leftBound = index;
            this.rightBound = index + this.options.numElements - 1;
        }
        this.scrollTo(index * this.computedWidth, time, fn);
    }

    ArrayView.prototype.rightTo = function (index) {
        index = parseInt(index, 10);
        if (isNan(index))
            return;
        if (index <= 0)
            index = 0;
        if (index >= this.state.array.length - 1)
            index = this.state.array.length - 1;
        var time = Math.min(Math.abs(index - this.leftBound) * this.options.stepTime, this.options.maxScrollTime);
        if (index <= this.options.numElements - 1) {
            this.leftBound = 0;
            this.rightBound = this.options.numElements - 1;
        } else if (index == this.state.array.length - 1) {
            this.leftBound = this.state.array.length - this.options.numElements;
            this.rightBound = this.state.array.length - 1;
        } else {
            this.leftBound = index - this.options.numElements + 1;
            this.rightBound = index;
        }
        scrollTo(index * this.computedWidth, time);
    }

    ArrayView.prototype.pageRight = function () {
        this.leftBound = this.leftBound + this.options.numElements <= this.state.array.length - this.options.numElements ? this.leftBound + this.options.numElements : this.state.array.length - this.options.numElements;
        this.rightBound = this.rightBound + this.options.numElements <= this.state.array.length - 1 ? this.rightBound + this.options.numElements : this.state.array.length - 1;
        page(true);
    }

    ArrayView.prototype.pageLeft = function () {
        this.leftBound = this.leftBound - this.options.numElements >= 0 ? this.leftBound - this.options.numElements : 0;
        this.rightBound = this.rightBound - this.options.numElements >= this.options.numElements - 1 ? this.rightBound - this.options.numElements : this.options.numElements - 1;
        page(false);
    }

    ArrayView.prototype.right = function () {
        this.leftBound = this.leftBound + 1 <= this.state.array.length - this.options.numElements ? this.leftBound + 1 : this.state.array.length - this.options.numElements;
        this.rightBound = this.rightBound + 1 <= this.state.array.length - 1 ? this.rightBound + 1 : this.state.array.length - 1;
        this.step(true);
    }

    ArrayView.prototype.left = function () {
        this.leftBound = this.leftBound - 1 >= 0 ? this.leftBound - 1 : 0;
        this.rightBound = this.rightBound - 1 >= this.options.numElements - 1 ? this.rightBound - 1 : this.options.numElements - 1;
        this.step(false);
    }

    ArrayView.prototype.page = function (right) {
        this.scroll(right, this.options.pageTime, this.width - 1);
    }

    ArrayView.prototype.step = function (right) {
        this.scroll(right, this.options.stepTime, this.computedWidth);
    }

    ArrayView.prototype.scroll = function (right, time, amount) {
        var str = '+=';
        if (!right) str = '-=';
        var anim = {};
        anim.scrollLeft = str + amount;
        this.$e.animate(anim, time);
        //this.fire('change', {});
    };

    ArrayView.prototype.scrollTo = function (amount, time, fn) {
        this.$e.animate({
            scrollLeft: amount
        }, time, function () {
            if (typeof fn !== 'undefined')
                fn();
        });
    };

    return ArrayView;
})();
