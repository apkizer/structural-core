S.addView('array', 'simple', 
  function (options) {
    var view = S.view(),
      config = {
        hiddenDelimiter: ',',
        numElements: 5,
        elementWidth: 20,
        pageTime: 300,
        stepTime: 50,
        scrollTime: 500,
        maxScrollTime: 1000,
        areObjs: false
      },
      $e,
      onScrollFn,
      computedWidth,
      wrapWidth,
      border = 0,
      $topRow,
      $bottomRow;
    $.extend(config, options);
    view.leftBound = 0;
    view.rightBound = config.numElements - 1;
      
    
      
    view.init = function() {
        //init logic ?
    }
    
    view.init();


    view.render = function() {
      if($e) {
          $e.remove();
      }
      $e = $('<div class="array"><table><tr></tr><tr class="indices"></tr></table></div>');
      $topRow = $e.find('tr').first();
      $bottomRow = $e.find('tr').eq(1);
      for(var i = 0; i < view.component.array.length; i++) {
        var $td = $('<td>' + view.component.array[i] + '<span style="font-size: 0;">' + config.hiddenDelimiter + '</span></td>').data('index', i),
          $th = $('<th>' + i + '</th>').data('index', i);
        $topRow.append($td);
        $bottomRow.append($th);
      }
      $e.find('td').add('th').css('width', config.elementWidth);
      computedWidth = config.elementWidth + border;
        
      setWrapWidth();

      bindEvents();
        
      view.$element.append($e);
        
      console.log('view.element ' + view.$element);
        
      return view.$element;
    }

    view.scaleTo = function(dimensions) {
      console.log('scaling');
      config.elementWidth = Math.floor(dimensions.width / config.numElements) - border;
      view.render();
    }
    
    function setWrapWidth() {
      /*wrapWidth = config.numElements * (config.elementWidth + border) + border;*/
      wrapWidth = config.numElements * computedWidth + border;
      $e.css('width', wrapWidth);
    }

    function bindEvents() {
      //$e.mousewheel(handleMousewheel); // TODO needs mousewheel
      $topRow.find('td').click(handleTdClick);
      $topRow.find('td').dblclick(handleTdDblClick);
    }

    function handleTdClick(e) {
      view.focus($(this).data('index'));
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
      onScrollFn();
    }

    function handleKeydown(e) {
      console.log('keyDown');
      if(e.keyCode === 39)
        view.right();
    }


    view.onScroll = function(fn) {
      onScrollFn = fn;
    }

    view.focus = function(index, fn) {
      console.log('focusing on ' + index);
      if(index < 0 || index > view.component.array.length - 1)
        return;
      $topRow.find('td').removeClass('focus');
      $bottomRow.find('th').removeClass('focus');
      var idx = index - Math.floor(config.numElements/2);
      $topRow.find('td').eq(index).addClass('focus');
      $bottomRow.find('th').eq(index).addClass('focus');
      view.leftTo(idx, fn);
    }

    view.clearfocus = function(fn) {
      $topRow.find('td').removeClass('focus');
      $bottomRow.find('th').removeClass('focus');
      fn();
    }

    view.flag = function(index, fn) {
      $topRow.find('td').eq(index).addClass('flagged');
      if(fn) fn();
    }

    view.range = function(start, end, num, fn) {
      var $range = $topRow.find('td').slice(start, end + 1),
        clazz = 'range' + num;
      $topRow.find('td').slice(start, end + 1).addClass(function(i){
        var classes = $range.eq(i).attr('class'),
          newClass = clazz + ' ' + classes;
        $range.eq(i).attr('class', newClass);
      });
      fn();
    }

    view.clearrange = function(num, fn) {
      $topRow.find('td').removeClass('range' + num);
      fn();
    }

    view.setItem = function(index, item, fn) {
      view.focus(index, function() {
        setTimeout(function() {
          var initialColor = $topRow.find('td').eq(index).css('color');
          //$topRow.find('td').eq(index).css('color', 'red');
          $topRow.find('td').eq(index).addClass('array-remove');
          setTimeout(function() {
            $topRow.find('td').eq(index).text(item);
            // TODO reset to configurable default color:
            //$topRow.find('td').eq(index).css('color', 'black'/*initialColor*/);
            $topRow.find('td').eq(index).removeClass('array-remove');
            fn();
          }, 300);
        }, 200);
      });
    }

    view.push = function(item, fn) {
      var $added = addItem(item, view.component.array.length -1);
      view.leftTo(view.component.array.length - 1, function() {
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
      var $both = $newTd.add($newTh).css('opacity', 0);
      $topRow.append($newTd);
      $bottomRow.append($newTh);
      /*$both.css('width', config.elementWidth);*/
      view.fire('change', {});
      return $both;
    }

    view.leftTo = function(index, fn) {
      index = parseInt(index, 10);
      if(isNaN(index))
        return;
      if(index <= 0)
        index = 0;
      if(index >= view.component.array.length - 1)
        index = view.component.array.length - 1;
      var time = Math.min(Math.abs(index - view.leftBound) * config.stepTime, config.maxScrollTime);
      if(index == 0) {
        view.leftBound = 0;
        view.rightBound = config.numElements - 1;
      } else if (index > view.component.array.length - config.numElements) {
        view.leftBound = view.component.array.length - config.numElements;
        view.rightBound = view.component.array.length - 1;
      } else {
        view.leftBound = index;
        view.rightBound = index + config.numElements - 1;
      }
      scrollTo(index * computedWidth, time, fn);
    }

    view.rightTo = function(index) {
      index = parseInt(index, 10);
      if(isNan(index))
        return;
      if(index <= 0)
        index = 0;
      if(index >= view.component.array.length - 1)
        index = view.component.array.length - 1;
      var time = Math.min(Math.abs(index - view.leftBound) * config.stepTime, config.maxScrollTime);
      if(index <= config.numElements - 1) {
        view.leftBound = 0;
        view.rightBound = config.numElements - 1;
      } else if (index == view.component.array.length - 1) {
        view.leftBound = view.component.array.length - config.numElements;
        view.rightBound = view.component.array.length - 1;
      } else {
        view.leftBound = index - config.numElements + 1;
        view.rightBound = index;
      }
      scrollTo(index * computedWidth, time);
    }

    view.pageRight = function() {
      view.leftBound = view.leftBound + config.numElements <= view.component.array.length - config.numElements ? view.leftBound + config.numElements : view.component.array.length - config.numElements;
      view.rightBound = view.rightBound + config.numElements <= view.component.array.length - 1 ? view.rightBound + config.numElements : view.component.array.length - 1;
      page(true);
    }

    view.pageLeft = function() {
      view.leftBound = view.leftBound - config.numElements >= 0 ? view.leftBound - config.numElements : 0;
      view.rightBound = view.rightBound - config.numElements >= config.numElements - 1 ? view.rightBound - config.numElements : config.numElements - 1;
      page(false);
    }

    view.right = function() {
      view.leftBound = view.leftBound + 1 <= view.component.array.length - config.numElements ? view.leftBound + 1 : view.component.array.length - config.numElements;
      view.rightBound = view.rightBound + 1 <= view.component.array.length - 1 ? view.rightBound + 1 : view.component.array.length - 1;
      step(true);
    }

    view.left = function() {
      view.leftBound = view.leftBound - 1 >= 0 ? view.leftBound - 1 : 0;
      view.rightBound = view.rightBound - 1 >= config.numElements - 1 ? view.rightBound - 1 : config.numElements - 1;
      step(false);
    }

    function page(right) {
      scroll(right, config.pageTime, wrapWidth - 1);
    }

    function step(right) {
      scroll(right, config.stepTime, computedWidth);
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
      var anim = {};
      anim.scrollLeft = amount;
      //view.fire('change', {}); //TODO add view events
      $e.animate(anim, time, function(){
        if(typeof fn !== 'undefined')
          fn();
      });
    }

    return view;
  });
