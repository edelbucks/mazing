This is a utility class that expresses n-dimensional integral matricies
allowing you to encode an N-dimensional cooridate into a value
with a single flattened integer. 

Assumptions:

* there are one or more dimensions with a min(imum) and max(imum) integral value. Each has a string name.
* each dimension is at least two integers; i.e., max > min. 
* values in that dimension can be from the minimum value (inclusive) up to the maximum value (inclusive).

## Creating a grid

Grids are crated by instantiating the grid class:

```javascript

const g = new Grid({min :-10, max: 10, name: 'x'}, {min: 5, max: 10, name: 'y'});

```
