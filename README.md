structural-core  [![Build Status](https://travis-ci.org/AlexKizer/structural-core.svg?branch=master)](https://travis-ci.org/AlexKizer/structural-core)
===============

# Introduction

## Purpose

Strucutral-core facilitates the development of programmable components with visual depictions. These components can represent data structures, algorithm visualizations, models of data, or many other things. The two characteristics that all structural-core components have is that they are programmable and able to be animated. Each component has an public-facing interface which defines its behavior. structural-core makes it easy to write code against this interface. 

For a concrete example, an Array component may have an interface with certain methods like "setValue" or "getValue", etc. Then, structural-core makes it easy to write code, such as sorting algorithms, on top of this interface in a natural way. When these algorithms are run, they can be paused and stepped-through, and the result of each action on the component is animated.

## Components and Views

In structural-core, views of components are responsible for all presentation logic, such as animating the behavior of their component. Component objects handle the actual logic of the data structure/whatever they represent. 

A component can operate asynchronously or synchronously, depending on whether or not it has a view. If it has a view, it's expected that the view will animate the component's behavior, so the component should operate asynchronously. Otherwise, the component should operate synchronously. This convention - having asynchronous behavior with a view and synchronous behavior without one - is important in structural-core because code in the library relies on it to allow algorithms to be written on top of components in a synchronous manner, even if behavior will later be animated. 

## Features

structural-core is lightweight and only provides a few key features:
- a base component class
- a base view class
- a 'deferred execution' utility which allows synchronous code to be written against an asynchronous interface
- a number of built in components 

## Deferred Execution

The `S.Deferred` class provides a key, useful feature: it allows _synchronous_ code to be written against an _asynchronous_ interface. This abstracts away the animateable aspect of components, and let's programmers write plain old code as if the components didn't animate their behavior at all. Without this interface, there would be a huge nest of callbacks in code that used components; imagine a mergesort implementation with callbacks for every array operation! 

# Tutorial

## The Array Component

Let's explore the bundled array component to gain some understanding. Here is its code as of 10/16/2014 :

    S.Array = (function () {
    
        function Array(state, view) {
            this.alias = 'array';
            S.Component.call(this, [].concat(state), view);
            this.state.flags = [];
        }
    
        Array.prototype = Object.create(S.Component.prototype);
        Array.prototype.constructor = Array;
    
        Array.prototype.getLength = function (next) {
            if (this.view)
                next(this.state.length);
            else
                return this.state.length;
        };
        Array.prototype.getLength.live = true;
    
        Array.prototype.flag = function (index, next) {
            this.state.flags[index] = true;
            if (this.view)
                this.view.flag(index, next);
        };
        Array.prototype.flag.live = true;
    
        Array.prototype.flagged = function (index, next) {
            if (this.view)
                next(this.state.length);
            else
                return this.state.flags[index];
        };
        Array.prototype.flagged.true;
    
        Array.prototype.setItem = function (index, value, next) {
            this.state[index] = value;
            if (this.view)
                this.view.setItem(index, value, next);
        };
        Array.prototype.setItem.live = true;
    
        Array.prototype.getItem = function (index, next) {
            if (this.view)
                next(this.state[index]);
            else
                return this.state[index];
        };
        Array.prototype.getItem.live = true;
    
        Array.prototype.push = function (item, next) {
            this.state.push(item);
            if (this.view)
                this.view.push(item, next);
        };
        Array.prototype.push.live = true;
    
        Array.prototype.focus = function (index, next) {
            if (this.view) this.view.focus(index, next);
        };
        Array.prototype.focus.live = true;
    
        Array.prototype.range = function (start, end, num, next) {
            if (this.view) this.view.range(start, end, num, next);
        };
        Array.prototype.range.live = true;
    
        Array.prototype.clearfocus = function (next) {
            if (this.view) this.view.clearfocus(next);
        };
        Array.prototype.clearfocus.live = true;
    
        Array.prototype.clearrange = function (num, next) {
            if (this.view) this.view.clearrange(num, next);
        };
        Array.prototype.clearrange.live = true;
    
        Array.prototype.leftTo = function (index, next) {
            if (this.view) this.view.leftTo(index, next);
        };
        Array.prototype.leftTo.live = true;
    
    
        return Array;
    
    })();

If you look at the code, much of it should be straightforward. It extends the `S.Component` class and calls its constructor.   

The `Array` constructor  takes in a state and a view. The state gives us initialization data. In this case, it is simply an array object. Notice that we pass `[].concat(state)` to the `Component` constructor. The reason for this is that we want an independent copy of the state data. If we didn't have an independent copy, the state could be altered and the array view would not be able to animate the change. The `flags` property on the state is just for a utility that allows boolean flags to be set on any array index.

After the constructor are a bunch of methods that make up the interface of the array component. After each method, you see that we set a `live` property on the method to true. This is simply for the deferred execution utility; it needs to know which functions are part of the actual interface of the component. Since this is pretty ugly, it may be changed in the future. But, for now, all interface methods of components should have a property called `live` set to a truthy value. 

Let's examine the `setItem` method specifically. It takes three parameters: `index`, `value,` and `next`. The first two are self-explanatory. The last one is a function callback. In structural, all of the methods of a component should accept a callback as the final parameter, since behavior should be animated. Further, this is expected by the `AsynchronousFunctionQueue` class, which is used by the deferred execution utility. The queue is a list of asynchronous functions which are called one by one; to be notified of when a function has finished and call the next function on the queue, the `AsynchronousFunctionQueue` passes in a callback. So, methods should always accept a callback as the final parameter.

Anyways, back to the method. Following the convention stressed earlier (second paragraph of "Components and Views"), we expect to use the `next` callback only if we have a view. In the case of `setItem`, if the array doesn't have a view, we're done. Otherwise, we call the corresponding method on the array's view, and pass _it_ the next callback. That's it. 

Generally, there are three types of component methods: component-only, view-only, or both. `setItem` used the array component and the array view. An example of a component-only method is the `getItem` method of the array. Retrieving the value at an index doesn't really have a natural visual depiction, so we don't animate it. However, we must still use the `next` callback if the array has a view. Passing the callback the new value/returning the new value is just for convenience. An example of a view-only method is `focus`. The scrolls the given index into view on the array's view. If the array has no view, the method just returns. Otherwise, it basically proxies the arguments to the view's `focus` method. You'll notice that `focus` and all the methods below it follow the exact same pattern, because they are view-only. Since writing these methods is tedious and repetitive, a better solution will be added in the future. 

That's it for now. Coming soon: the array view.