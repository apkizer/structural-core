/* notes */

var myArray = S.array({
  array: [0, 3, 1, 5, 2]
});

var result = S.algos.insertion(myArray);

result.execute(); // self executing

S.stepper(result); // execute using stepper
