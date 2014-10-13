structural-core  [![Build Status](https://travis-ci.org/AlexKizer/structural-core.svg?branch=master)](https://travis-ci.org/AlexKizer/structural-core)
===============

strucutral-core facilitates the development of programmable components with visual depictions. These components can represent data structures,  algorithmic visualizations, models of data, or many other things. The two characteristics that all structural-core components have is that they are programmable and able to be animated. Each component has an interface which declares its behavior. Code can then be written against this interface.

The design philosophy of components roughly follows MVC.

For a concrete example, an Array component may have an interface with certain methods like "setValue" or "getValue", etc. Then, structural-core makes it easy for developers or students to write code, such as sorting algorithms, on top of this interface in a natural way. When these algorithms are run, structural-core allows code to be stepped through and replayed.
### How to Build
`npm install`, then build with `grunt`.
