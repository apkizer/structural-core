/* notes */

var myArray = S.array({
  array: [0, 3, 1, 5, 2]
});

var result = S.algos.insertion(myArray);

result.execute(); // self executing

S.stepper(result); // execute using stepper


S.algorithm(meta, reqs, func);

S.algorithm({
  name: 'insertion',
  desc: 'A simple insertion sort.',
  author: '*'
}, ['array!', 'comments']);

// tree view:

tree.node(value);
tree.traverse('level', 'consider');
tree.node(c('currentNode'), 45);
