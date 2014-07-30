/* Structural, by Alex Kizer */ 
window.S = (function($) {
  var S = {};
  S.components = {};
  S.views = {};
  var id = 0;
    
  S.components.getFactory = function(name) {
      if(S.components[name])
        return S.components[name].factory;
  }
  
  S.config = {
      viewClass: 'sview'
  };

  S.wait = function(func, time) {
      setTimeout(func, time);
  }
  
  if(!$)
    console.log('jQuery is missing.');

  S.add = function(name, func) {
    func.factory = func; // so that livewrap can copy   
    console.log('func.factory is ' + func.factory);
      
    // add in queue, rewrite methods
   /* var actualFunc = function() {
        var c = {};
        c = func.apply(this, arguments);
    }*/
    
      
    S.components[name] = func;
  }

  S.addView = function(component, name, func) {
    if(!S.views[component])
      S.views[component] = {};
    S.views[component][name] = func;
  }

  S.simpleWrappable = function() {
    var wrappable = {
      live: {},
      async: {}
    };
      
    wrappable.getSync = function() {
      return wrappable.live;
    }
    
    wrappable.getAsync = function() {
      return wrappable.async;
    }
    
    return wrappable;
  }

  S.nextId = function() {
    return 'sid_' + id++;
  }

  S.map = function() {
    var _map = {},
      map = function(key, value) {
      console.log('attempting to store ' + key.sid);
      if(!key.sid)
        throw new Error('S.map() requires sid property. Use S.nextId().');
      if(typeof value === 'undefined') {
        return _map[key.sid];
      }
      _map[key.sid] = value;
    };

    map.clear = function() {
      _map = {};
    };

    map.delete = function(key) {
      if(!key.sid)
        throw new Error('S.map() requires sid property. Use S.nextId().');
      delete _map[key.sid];
    };

    map.has = function(key) {
      if(!key.sid)
        throw new Error('S.map() requires sid property. Use S.nextId().');
      return typeof _map[key.sid] !== 'undefined';
    }

    map.forEach = function(fn, thisArg) {
      if(!thisArg)
        thisArg = {};
      for(var key in _map) {
        fn.call(thisArg, [key, _map[key]]);
      }
    }

    return map;
  }
  return S;
})(jQuery);
S.ee = function() {
  var ee = {};
  ee.registeredEvents = {};

  ee.on = function(eventName, fn) {
    if(typeof ee.registeredEvents[eventName] === 'undefined')
      ee.registeredEvents[eventName] = [];
    ee.registeredEvents[eventName].push(fn);
  };

  ee.fire = function(eventName, event) {
    if(typeof ee.registeredEvents[eventName] === 'undefined')
      return;
    for(var i = 0; i < ee.registeredEvents[eventName].length; i++) {
      ee.registeredEvents[eventName][i].call(event, event);
    }
  };

  return ee;
}
if(!S) console.log('S is not defined.');
if(!S.ee) console.log('S is not defined.');

S.base = function(view) {
  var c = S.ee();
  c.live = {};
  c.algo = {};
  c.factory = {};
  if(view) {
    c.view = view;
    view.component = c;
  }

  c.structureName = 'general';

  c.setView = function(view) {
    c.view = view;
    view.setComponent(c);
  }

  c.copy = function(other) {
    c.setState(other.getState());
  };
    
  c.getFactory = function() {
    console.log('getState not implemented!');
  }

  c.getState = function() {
    console.log('getState not implemented!');
  };

  c.setState = function(state) {
    console.log('setState not implemented!');
  };

  // wrappable interface:

  c.getSync = function() {
    return c.live;
  }

  c.getAsync = function() {
    return c.view;
  }

  return c;
}
if(!S) console.log('S is not defined.')
if(!S.ee) console.log('S.ee is not defined.')

S.view = function() {
  var v = S.ee(),
    _speed = 0;

  v.$element = $('<div></div>').addClass(S.config.viewClass);
    
  v.speed = function(speed) {
    if(!speed)
      return _speed;
    var spd = Math.min(5, Math.max(1, speed)); // 1 <= speed <= 5
    _speed = spd;
  }

  v.focus = function() {
    // focus
    console.log('focus?')
    if(v.$e) {
      v.$e.css('border', '2px solid blue');
      console.log('focused');
    }
  }

  v.unfocus = function() {
    if(v.$e)
      v.$e.css('box-shadow', 'none');
  }

  return v;
}
S.live = function(component) {
    
  var algo = function(key, value){
      if(!value)
        return algo.get(key);
      algo.set(key, value);
    },
    fns = [], //array of functions that accept a single callback param
    properties = [],
    open = true,
    last = 0,
    vars = {}; // TODO move to std

  //mixin event handling:
  $.extend(algo, S.ee());

  algo.paused = false;

  var std = S.simpleWrappable()

  std.live.end = function(){
    algo.fire('end', {}); // todo create event object
  }
  std.live.set = function(key, value) {
    vars[key] = value;
  }

  std.live.get = function(key) {
    return vars[key];
  }

  std.live.is = function(key, value) {
    return vars[key] === value;
  }

  std.live.log = function(str) {
      console.log(str);
  }

  // build the livewrap. for each method on the component's live, create a clone method which first calls the sync portion of the method, then queues both the sync & async portions

  algo.wrap = function(item, wrapAlgo) {
    if(typeof item.getSync === 'undefined' || typeof item.getAsync === 'undefined') {
      console.log('cannot livewrap item. no item.getSync() or item.getAsync()');
      return;
    }
    for(var prop in item.getSync()) {
      algo[prop] =
        // inject property; otherwise, pushed functions will all reference last iterated property
        (function(property){
          var func = function() {
            if(!open)
              return;
            var args = Array.prototype.slice.call(arguments), // convert arguments to an array
              ret = null; // proxy return of sync portion
            //null indicates that the method is async only (superficial)
            if(item.getSync()[property] !== null) {
              //do now
              ret = item.live[property].apply({}, args);
            }
            //push async & sync if found on view:
            var pushFn;
            if(item.getAsync().hasOwnProperty(property) && item.getSync()[property] !== null) {
              // both
              pushFn = function(fn) {
                item.getSync()[property].apply(item.getSync(), args);
                item.getAsync()[property].apply(item.getAsync(), args.concat(fn)); // concat callback
              }
            } else if(item.getSync()[property] !== null) {
              // sync only
              pushFn = function(fn) {
                item.getSync()[property].apply(item.getSync(), args);
                fn();
              }
            } else if(item.getAsync().hasOwnProperty(property)) {
              // async only
              pushFn = function(fn) {
                item.getAsync()[property].apply(item.getAsync(), args.concat(fn)); // concat callback
              }
            } else {
              // declared as async only, but method not found on view.
              console.log('method ' + property.toString() + ' was declared as async only (null), but no corresponding view method was found.');
              pushFn = false;
            }
            if(pushFn)
              fns.push(pushFn);
            if(ret !== null)
              return ret;
          };
          return func;
        })(prop);
    }
  }

  algo.wrap(std);
  if(Array.isArray(component)) {
      console.log('is array!');
    component.forEach(function(c){
      algo.wrap(c);
    });
  } else {
    algo.wrap(component);
  }

  algo.close = function() {
    open = false;
  }

  algo.pause = function(){
    algo.paused = true;
  }

  algo.play = function() {
    algo.paused = false;
    algo.exec();
  }

  algo.getIndex = function() {
    return last;
  }

  algo.__getLength = function() {
    return fns.length;
  }

  algo.exec = function() {
    console.log('exec: fns.length ' + fns.length);
    if(open)
      return;
    var i = last;
    function doNext() {
      console.log('doNext');
      console.log(fns[i]);
      if(i >= fns.length) {
        algo.fire('end', {}); // todo create event obj
        return;
      }
      else if(algo.paused) {
        return;
      }
      algo.fire('update', {});
      last++;
      fns[i++].call({}, function(){
        setTimeout(doNext, 0);
      });
    }
    doNext();
  }
  
  algo.finish = function() {
      
  }

  return algo;
}
function live(component){var algo=function(key,value){if(!value)return algo.get(key);algo.set(key,value)},fns=[],properties=[],open=true,last=0,vars={};$.extend(algo,S.ee());algo.paused=false;var std=S.simpleWrappable();std.live.end=function(){algo.fire("end",{})};std.live.set=function(key,value){vars[key]=value};std.live.get=function(key){return vars[key]};std.live.is=function(key,value){return vars[key]===value};std.live.log=function(str){console.log(str)};algo.wrap=function(item,wrapAlgo){console.log("item is "+item);if(typeof item.getSync==="undefined"||typeof item.getAsync==="undefined"){console.log("cannot livewrap item. no item.getSync() or item.getAsync()");return}for(var prop in item.getSync()){algo[prop]=function(property){var func=function(){if(!open)return;var args=Array.prototype.slice.call(arguments),ret=null;if(item.getSync()[property]!==null){ret=item.live[property].apply({},args)}var pushFn;if(item.getAsync().hasOwnProperty(property)&&item.getSync()[property]!==null){pushFn=function(fn){item.getSync()[property].apply(item.getSync(),args);item.getAsync()[property].apply(item.getAsync(),args.concat(fn))}}else if(item.getSync()[property]!==null){pushFn=function(fn){item.getSync()[property].apply(item.getSync(),args);fn()}}else if(item.getAsync().hasOwnProperty(property)){pushFn=function(fn){item.getAsync()[property].apply(item.getAsync(),args.concat(fn))}}else{console.log("method "+property.toString()+" was declared as async only (null), but no corresponding view method was found.");pushFn=false}if(pushFn)fns.push(pushFn);if(ret!==null)return ret};return func}(prop)}};algo.wrap(std);if(Array.isArray(component)){console.log("is array!");component.forEach(function(c){algo.wrap(c)})}else{algo.wrap(component)}algo.close=function(){open=false};algo.pause=function(){algo.paused=true};algo.play=function(){algo.paused=false;algo.exec()};algo.getIndex=function(){return last};algo.__getLength=function(){return fns.length};algo.exec=function(){console.log("exec: fns.length "+fns.length);if(open)return;var i=last;function doNext(){console.log("doNext");console.log(fns[i]);if(i>=fns.length){algo.fire("end",{});return}else if(algo.paused){return}algo.fire("update",{});last++;fns[i++].call({},function(){setTimeout(doNext,0)})}doNext()};return algo}
S.add('array', function (arr, view) {
    var c = S.base(view),
      flags = [],
      self = this;
    c.array = arr;
    
    console.log('c.factory is ' + c.factory);

    c.live.focus = null; // informs livewrap that this method only makes sense async
    c.live.range = null;
    c.live.clearfocus = null;
    c.live.clearrange = null;
    c.live.leftTo = null;
    
    c.getFactory = function() {
        console.log('returning factory');
        return self.getFactory('array');
    }

    c.live.getLength = function() {
      return c.array.length;
    }

    c.live.test = function() {
      return 9;
    }

    c.live.flag = function(index) {
      flags[index] = true;
    }

    c.live.isFlagged = function(index) {
      return !!flags[index];
    }

    c.live.setItem = function(index, value) {
      c.array[index] = value;
    }
    
    c.live.getItem = function(index) {
      return c.array[index];
    }

    c.live.push = function(item) {
      c.array.push(item);
    }

    return c;
  });


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
    array = config.array;
    view.array = array;
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
      //view.init();
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



S.add('tree', function (view) {
  var c = S.base(view),
    nodes = S.map();
  c.tree = new Node(0);


  function Node(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.sid = S.nextId();
  }

  c.init = function(root) {
    c.tree = copyTree(root);
  }

  function copyTree(node) {
    if(!node)
      return null;
    var n = new Node(node.value);
    n.left = copyTree(node.left);
    n.right = copyTree(node.right);
    return n;
  }

  c.live.add = function(parent, left, value) {
    if(!nodes.has(parent))
      return;
    if(left) {
      nodes(parent).left = new Node(value);
    } else {
      nodes(parent).right = new Node(value);
    }
  }

  c.live.root = function() {
    if(c.tree)
      return c.tree;//.sid;
  }
  
  c.live.traverse = null;

  c.live.focusNode = null;

  return c;
});


S.addView('tree', 'simple', function () {
  var view = S.view(),
    elems = S.map(),
    positions = S.map(),
    opts = {
      mh: 30,
      mv: 50
    },
    $e,
    svg,
    $svg,
    data = S.map();

  view.init = function() {
    $e = $('<div class="tree"></div>');
    // http://stackoverflow.com/questions/20045532/snap-svg-cant-find-dynamically-and-successfully-appended-svg-element-with-jqu
    var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    $e.append($(svgElement));
    $svg = $e.find('svg').first();
      
      $svg.width(1000);
      $svg.height(300);
      
    $svg.addClass('tree-svg');
    svg = Snap(svgElement);
    console.log('typeof elem ' + typeof $e.find('svg').first().get());
    rg(view.component.tree, positions, opts);
    drawLines(view.component.tree);
    drawTree(view.component.tree);
    drawValues(view.component.tree);
  }

  function drawNode(node, value, x, y) {
    var circle = svg.circle(x, y, 10);
    circle.addClass('tree-node');
    elems(node, circle);
  }
    
    function drawValues(root) {
        if(root) {
            svg.text(positions(root).x + 500 - 5, positions(root).y + 10 + 5, root.value + '')
                .addClass('tree-node-value');
            drawValues(root.left);
            drawValues(root.right);
        }
    }
    
    function drawLines(root) {
        if(root.left) {
            svg.line(positions(root).x + 500, positions(root).y + 10, positions(root.left).x + 500, positions(root.left).y + 10).attr('stroke', 'black');
            drawLines(root.left);
        }
        if(root.right) {
            svg.line(positions(root).x + 500, positions(root).y + 10, positions(root.right).x + 500, positions(root.right).y + 10).attr('stroke', 'black');
            drawLines(root.right);
        }
    }

  function drawTree(root) {
    if(!root)
      return;
    drawNode(root, root.value, positions(root).x + 500, positions(root).y + 10);
    drawTree(root.left);
    drawTree(root.right);
  };

  view.scaleTo = function(dimensions) {
    $e.width(dimensions.width);
    $e.height(dimensions.height);
  }


  view.render = function() {
    return $e;
  }
  

  view.focusNode = function(node, fn) {
      console.log('treeview.focus');
    focus(elems(node), fn);
  }

  function focus($elem, fn) {
      console.log('treeview.focus');
    $elem.addClass('focus');
    S.wait(function(){
      $elem.removeClass('focus');
      console.log('calling fn!');
      fn();
    }, 500);
  }


  view.add = function(parent_s, left, value, fn) {
    elems(parent_s, getNodeElement(value));
    rg(view.component.tree, positions, opts);
    elems.forEach(function(pair){
      move(elems(pair[0]), pair[1].x, pair[1].y, function(){
        $e.append(elems(parent_s));
      });
    });
  }

  function move($elem, x, y, fn) {
    $elem.animate({
      left: x,
      top: y
    }, 250, function(){
      fn();
    });
  }

  function getNodeElement(value) {
    return $('<span class="node">' + value + '</span>')
  }

  function rg(root, store, options) {
    //1. copy tree
    //2. run rg
    //3. copy to store


    var config = {
      mh: 10,
      mv: 10
    };

    $.extend(config, options);
    var _root = copyTree(root);
    console.log('printing _root');
    printTree(_root);
    setup(_root, 0, null, null);
    assign(_root, 0, false);
    copyToStore(_root, store);

    function RNode(node) {
      console.log('R ' + node.value);
      this.value = node.value;
      this.left = null;//node.left;
      this.right = null;//node.right;
      this.x = 0;
      this.y = 0;
      this.thread = false;
      this.offset = 0;
      this.sid = node.sid;
    }

    function Extreme(node) {
      this.node = node;
      this.offset = 0;
      this.level = 0;
    }

    function copyTree(node) {
      var copy;
      if(!node)
        copy = null;
      else {
        /*copy = {};
         copy.value = node.value;*/
        copy = new RNode(node);
        copy.left = copyTree(node.left);
        copy.right = copyTree(node.right);
      }
      return copy;
    }

    function printTree(root) {
      if(!root)
        return;
      console.log(root.value)
      printTree(root.left);
      printTree(root.right);
    }

    function setup(node, level, rightMost, leftMost) {
      var left,
        right,
        lRightMost = new Extreme(null),
        lLeftMost = new Extreme(null),
        rRightMost = new Extreme(null),
        rLeftMost = new Extreme(null);

      // while loop variables:
      var currentSeparation, // The separation between contour nodes on the current level
        rootSeparation, // ?
        leftOffsetSum,  // offset from root
        rightOffsetSum; // offset from root


      if(!node /*== null*/) {
        // base case ?
        // ? update leftMost, rightMost
        leftMost.level = -1;
        rightMost.level = -1;
        return;
      }

      node.y = level * config.mv;
      left = node.left;
      console.log('left is ' + left);
      right = node.right;
      setup(left, level + 1, lRightMost, lLeftMost);
      setup(right, level + 1, rRightMost, rLeftMost);
      if(left === null && right === null) {
        // node is a leaf
        // base case?
        rightMost.node = node;
        leftMost.node = node;
        rightMost.level = level; // single node is both rightMost and leftMost on lowest level (which is current level)
        leftMost.level = level;
        rightMost.offset = 0; // ? TODO
        leftMost.offset = 0;  // ? TODO
        node.offset = 0;
      } else {
        // node is not a leaf

        currentSeparation = config.mh; // margin = minimum separation between two nodes on a level
        rootSeparation = config.mh; // ? TODO
        leftOffsetSum = 0;
        rightOffsetSum = 0;

        while(left !== null && right !== null) {

          if(currentSeparation < config.mh) { // nodes are too close together

            // Increase rootSeparation just enough so that it accounts for difference between
            // config.mh and currentSeparation:
            rootSeparation += (config.mh - currentSeparation);

            // Now, increase currentSeparation to the minimumSeparation:
            currentSeparation = config.mh;

          }

// left contour:
          if(left.right !== null) {

            // leftOffsetSum is offset of left from root
            // left.offset = distance to each son
            // increase leftOffsetSum by left's offset from each child:
            leftOffsetSum += left.offset;

            // At this level, now, currentSeparation is decreased by left.offset,
            // because that is how far out left's right child is stick out.
            currentSeparation -= left.offset;

            // Go to next level, next on contour:
            left = left.right;
          } else {

            //left.right is null.

            // We can move left in now:
            leftOffsetSum -= left.offset; // ? TODO

            // We've allowed more separation ?
            currentSeparation += left.offset;

            // Go to next level, next on contour:
            left = left.left;
          }

// right contour:
          if(right.left !== null) {
            rightOffsetSum -= right.offset;
            currentSeparation -= right.offset;
            right = right.left;
          } else {
            rightOffsetSum += right.offset;
            currentSeparation += right.offset;
            right = right.right;
          }

        }

// set root's offset:
        node.offset = (rootSeparation + 1) / 2;
// ? TODO :
        leftOffsetSum -= node.offset;
        rightOffsetSum += node.offset;

// determine 2 extremes from the 4 we have:
// pick leftMost:
        if(rLeftMost.level > lLeftMost.level || node.left == null) {
          // rLeftMost wins
          leftMost = rLeftMost;
          leftMost.offset += node.offset; // ? TODO
        } else {
          // lLeftMost wins
          leftMost = lLeftMost;
          leftMost.offset -= node.offset;
        }


// threading:
// necessary if uneven heights? TODO

        if(left != null && left != node.left) {
          rRightMost.node.thread = true;
          // no idea what's going on here: TODO
          rRightMost.node.offset = Math.abs( (rRightMost.offset + node.offset) - leftOffsetSum);
          if(leftOffsetSum - node.offset <= rRightMost.offset) {
            rRightMost.node.left = left;
          } else {
            rRightMost.node.right = left;
          }
        } else if(right != null && right != node.right) {
          lLeftMost.node.thread = true;
          lLeftMost.node.offset = Math.abs( (lLeftMost.offset - node.offset) - rightOffsetSum);
          if(rightOffsetSum + node.offset >= lLeftMost.offset) {
            lLeftMost.node.right = right;
          } else {
            lLeftMost.node.left = right;
          }
        } else {
          // nothing
        }

      }


    }

    function assign(node, x, useNew) {
      if(node != null) {
        node.x = x;
        if(node.thread) {
          // clean up threading:
          node.thread = false;
          node.right = null;
          node.left = null;
        }
        // ? TODO
        assign(node.left, x - node.offset, useNew);
        assign(node.right, x + node.offset, useNew);
      }
    }

    function copyToStore(root, store) {

      if(!root)
        return;
      console.log('STORING ' + root.sid);
      store(root, {
        x: root.x,
        y: root.y
      });
      copyToStore(root.left, store);
      copyToStore(root.right, store);
    }


  }

  return view;
} );




