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

const g = new Grid(
  {min :-10, max: 10, name: 'x'},
  {min: 5, max: 10, name: 'y'}
);
```
Grid stores everything based on the reduction of a coordinate to 
an index. This makes storing key-value pairs for the grids' content
in arrays/Maps.

There are two types of storage:

* **sparse** data (data with a lot of missing values) are stored in Maps.
* **dense** data (data with mostly or completely filled-out grids) are stored in arrays.

In both cases the data is stored as an indexed value. There is no 
assumptions about what is stored in a grid. 

## API

### constructor(dim, dim, dim) 

defines the dimensions of the array. 
Dimensions can be defined using various notation: 
#### min-max
```
{name: 'x', min: 0, max: 20}
```

#### radius 
```
{name: 'y', radius: 5}
// === {name: 'y', min: -5, max: 5}
```

#### size 
```
{name: 'y', size: 5}
// === {name: 'y', min: 0, max: 5}
```

### get(point); get(index)

returns the value stored for a given coordinate or index. 

### set(point, value)

sets the value stored at a given coordinate value or index. 

### storage

'sparse' or 'dense'. Setting this value defines the storage system
for data AND erases any stored data. 

### store (read only) 

a map or array; the currently stored data.

### seedFunction 

a property that if set, returns a value for any unset point. 
That value is stored before returned from get(), but is used lazily;
that is, setting the seed function doesn't change 
anything in storage until `get(point)` is called, and changing the 
seed function won't update any previously retrieved values. 

### near(point, ortho = false) 

returns all the points within +/- 1 of the given point.
if ortho(gonal) is true, returns coordinates that are only adjacent
by one dimension from the given point. otherwise includes diagonals. 

ortho returns 2 * (number of dimensions) points. 

non-ortho returns 3 ** (number of dimensions) points. 

note - the return value is a set of points that is NOT filtered by 
containment in the grid. 
k

## Trust Jebus

This is a very alpha, speed oriented module. As such, there is not a lot
of data validation and type-checking. 
