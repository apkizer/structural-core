### SIGED GUYS: I'm in the middle of refactoring the tree view and array view to extend the View class. Previously, these were implemented as factory functions, as you can see with the array.view.js file, if I haven't changed it. The copying and scope stuff I was talking about is in js/core/deferred. I'm still editing the DeferredInterface class, but you can still look at it to get the idea. Hopefully I'll have the refactor done by the next meeting. ~ Alex

structural-core  [![Build Status](https://travis-ci.org/AlexKizer/structural-core.svg?branch=master)](https://travis-ci.org/AlexKizer/structural-core)
===============

The core library for the Structural web app. Allows you to create components with animated views that represent data structures, and write code for these structures that executes asynchronously. Specifically, structural-core lets you:
* Create components with animated views.
* Wrap the methods of these components with a deferred execution context which lets you animate the code you write.
* Use or extend a set of standard, already-coded data structures.
* Use a set of standard algorithms that operate on the aforementioned data structures.

### Bundled Data Structures
* array
* binary search tree (with AVL variant)
* binary heap (coming soon)
* stack/queue (coming soon)

### How to Build
`npm install`, then build with `grunt`.
