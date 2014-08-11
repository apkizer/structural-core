
S.view('array', 
  function (options) {
    var view = new S.View(), //S.baseView(),
        $e,
        $table,
        $topRow,
        $bottomRow,
        $cells = $(),
        $indices = $(),
        computedWidth,
        width,
        border = 0,
        computedCellWidth,
        height;
        
    view.init = function() {
      view.config = {
        hiddenDelimiter: ',', 
        numElements: 5, 
        pageTime: 300, 
        stepTime: 50, 
        scrollTime: 500, 
        maxScrollTime: 1000
      };
      view.config = options;
      view.leftBound = 0;
      view.rightBound = view.config.numElements - 1;
    }
    
    view.config = function(options) {
      $.extend(view.config, options);
      view.leftBound = 0;
      view.rightBound = view.config.numElements - 1;
    }

    view.render = function() {
      if($e)
        $e.remove();
      $cells = $();
      $indices = $();
      $e = $('<div class="array"></div>');
      $table = $('<table></table>');
      $topRow = $('<tr></tr>').addClass('array-top');
      $bottomRow = $('<tr></tr>').addClass('array-bottom');
      $e.append($table);
      $table.append($topRow).append($bottomRow); 
      
      $table.css({
        height: height
      });
      
      $topRow.css({
        fontSize: Math.round($table.height() * .25)
      });
      
      for(var i = 0; i < view.component.array.length; i++) {
        var $td = $('<td>' + view.component.array[i] + '<span style="font-size: 0;">' + view.config.hiddenDelimiter + '</span></td>'),
            $th = $('<th>' + i + '</th>');
        $td.data('index', i);
        $th.data('index', i);
        $td.width(computedCellWidth);
        $th.width(computedCellWidth);
        $td.addClass('array-cell');
        $th.addClass('array-index');
        $topRow.append($td);
        $bottomRow.append($th);
        $cells = $cells.add($td);
        $indices = $indices.add($th);
      }

      computedWidth = computedCellWidth + border;
      width = view.config.numElements * computedWidth + border;
      $e.css('width', width);
      bindEvents($cells);
      view.$element.append($e);
      return view.$element;
    }

    view.scaleTo = function(dimensions) {
      width = dimensions.width;
      height = dimensions.height;
      view.$element.css('width', dimensions.width);
      view.$element.css('height', dimensions.height);
      computedCellWidth = Math.floor(width / view.config.numElements) - border;
      view.render();  
    }

    function bindEvents($_cells, $_indices) {
      //$e.mousewheel(handleMousewheel); // TODO needs mousewheel
      $_cells.click(handleTdClick);
      $_cells.dblclick(handleTdDblClick);
    }

    function handleTdClick(e) {
      console.log('handleTdClick');
      console.log('setting focus to ' + $(this).data('index'));
      view.live.focus($(this).data('index'));
    }

    function handleTdDblClick(e) {
      // TODO inform component
      if($(this).hasClass('flagged'))
        $(this).removeClass('flagged');
      else
        $(this).addClass('flagged');
    }

    function handleMousewheel(e) {
      console.log(e);
      if(e.deltaY < 0) {
        view.left();
      } else {
        view.right();
      }
    }

    function handleKeydown(e) {
      console.log('keyDown');
      if(e.keyCode === 39)
        view.right();
    }

    view.live.focus = function(index, fn) {
      if(index < 0 || index > view.component.array.length - 1)
        return;
      $cells.removeClass('focus');
      $indices.removeClass('focus');
      $cells.eq(index).addClass('focus');
      $indices.eq(index).addClass('focus');
      var idx = index - Math.floor(view.config.numElements/2);
      view.live.leftTo(idx, fn);
    }

    view.live.clearfocus = function(fn) {
      $cells.removeClass('focus');
      $indices.removeClass('focus');
      fn();
    }

    view.live.flag = function(index, fn) {
      $cells.eq(index).addClass('flagged');
      if(fn) fn();
    }

    view.live.range = function(start, end, num, fn) {
      var $range = $cells.slice(start, end + 1),
          clazz = 'range' + num;
      // TODO why do I do this? -v
      $range.addClass(function(i){
        var classes = $range.eq(i).attr('class'),
          newClass = clazz + ' ' + classes;
        $range.eq(i).attr('class', newClass);
      });
      fn();
    }

    view.live.clearrange = function(num, fn) {
      $cells.removeClass('range' + num);
      fn();
    }

    view.live.setItem = function(index, item, fn) {
      view.live.focus(index, function() {
        S.wait(function() {
          $cells.eq(index).addClass('array-remove');
          S.wait(function() {
            $cells.eq(index).text(item);
            $cells.eq(index).removeClass('array-remove');
            fn();
          }, 300);
        }, 200);
      });
    }

    view.live.push = function(item, fn) {
      console.log('pushing ' + item + ' in array.view.js');
      console.log('view.component.array = ' + view.component.array);
      console.log('view.component.array.length = ' + view.component.array.length);
      console.log('view.component.array.length - 1 = ' +  view.component.array.length - 1);
      var $added = addItem(item, view.component.array.length - 1);
      view.live.leftTo(view.component.array.length - 1, function() {
        $added.animate({
          opacity: 1
        }, 200, function(){
          fn();
        });
      });
    }

    function addItem(item, index) {
      var $newTd = $('<td>' + item + '</td>'),
        $newTh = $('<th>' + index + '</th>');
      var $both = $newTd.add($newTh).css({
        opacity: 0,
        width: computedCellWidth
      });
      $newTd.addClass('array-cell');
      $newTh.addClass('array-index');
      $both.data('index', index);
      $topRow.append($newTd);
      $bottomRow.append($newTh);
      $cells = $cells.add($newTd);
      $indices = $indices.add($newTh);
      bindEvents($newTd, $newTh);
      return $both;
    }

    view.live.leftTo = function(index, fn) {
      index = parseInt(index, 10);
      if(isNaN(index))
        return;
      if(index <= 0)
        index = 0;
      if(index >= view.component.array.length - 1)
        index = view.component.array.length - 1;
      var time = Math.min(Math.abs(index - view.leftBound) * view.config.stepTime, view.config.maxScrollTime);
      if(index == 0) {
        view.leftBound = 0;
        view.rightBound = view.config.numElements - 1;
      } else if (index > view.component.array.length - view.config.numElements) {
        view.leftBound = view.component.array.length - view.config.numElements;
        view.rightBound = view.component.array.length - 1;
      } else {
        view.leftBound = index;
        view.rightBound = index + view.config.numElements - 1;
      }
      scrollTo(index * computedWidth, time, fn);
    }

    view.live.rightTo = function(index) {
      index = parseInt(index, 10);
      if(isNan(index))
        return;
      if(index <= 0)
        index = 0;
      if(index >= view.component.array.length - 1)
        index = view.component.array.length - 1;
      var time = Math.min(Math.abs(index - view.leftBound) * view.config.stepTime, view.config.maxScrollTime);
      if(index <= view.config.numElements - 1) {
        view.leftBound = 0;
        view.rightBound = view.config.numElements - 1;
      } else if (index == view.component.array.length - 1) {
        view.leftBound = view.component.array.length - view.config.numElements;
        view.rightBound = view.component.array.length - 1;
      } else {
        view.leftBound = index - view.config.numElements + 1;
        view.rightBound = index;
      }
      scrollTo(index * computedWidth, time);
    }

    view.pageRight = function() {
      view.leftBound = view.leftBound + view.config.numElements <= view.component.array.length - view.config.numElements ? view.leftBound + view.config.numElements : view.component.array.length - view.config.numElements;
      view.rightBound = view.rightBound + view.config.numElements <= view.component.array.length - 1 ? view.rightBound + view.config.numElements : view.component.array.length - 1;
      page(true);
    }

    view.pageLeft = function() {
      view.leftBound = view.leftBound - view.config.numElements >= 0 ? view.leftBound - view.config.numElements : 0;
      view.rightBound = view.rightBound - view.config.numElements >= view.config.numElements - 1 ? view.rightBound - view.config.numElements : view.config.numElements - 1;
      page(false);
    }

    view.right = function() {
      view.leftBound = view.leftBound + 1 <= view.component.array.length - view.config.numElements ? view.leftBound + 1 : view.component.array.length - view.config.numElements;
      view.rightBound = view.rightBound + 1 <= view.component.array.length - 1 ? view.rightBound + 1 : view.component.array.length - 1;
      step(true);
    }

    view.left = function() {
      view.leftBound = view.leftBound - 1 >= 0 ? view.leftBound - 1 : 0;
      view.rightBound = view.rightBound - 1 >= view.config.numElements - 1 ? view.rightBound - 1 : view.config.numElements - 1;
      step(false);
    }

    function page(right) {
      scroll(right, view.config.pageTime, width - 1);
    }

    function step(right) {
      scroll(right, view.config.stepTime, computedWidth);
    }

    function scroll(right, time, amount) {
      var str = '+=';
      if(!right) str = '-=';
      var anim = {};
      anim.scrollLeft = str + amount;
      $e.animate(anim, time);
      //view.fire('change', {});
    }

    function scrollTo(amount, time, fn) {
      $e.animate({
        scrollLeft: amount
      }, time, function(){
        if(typeof fn !== 'undefined')
          fn();
      });
    }

    return view;
  });