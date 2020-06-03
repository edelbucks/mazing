const { Grid } = require('../lib');


const grid = new Grid({ name: 'x', min: 1, max: 4 }, { name: 'y', min: 1, max: 4 },
  { name: 'z', min: 1, max: 4 });

console.log('weight of ', 0, grid.weight(0));
console.log('weight of ', 1, grid.weight(1));
console.log('weight of ', 2, grid.weight(2));

for (let z = 1; z <= 4; ++z) {
  for (let y = 1; y <= 4; ++y) {
    for (let x = 1; x <= 4; ++x) {
      console.log('x:', x, 'y:', y, 'z', z, 'flat: ', grid.flatten({ x, y, z }));
    }
  }
}

console.log('unflatten: ----');

for (let i = 0; i < 4 ** 3; ++i) {
  const { x, y, z } = grid.unflatten(i);
  console.log('x:', x, 'y:', y, 'z', z, 'flat: ', i);
}
