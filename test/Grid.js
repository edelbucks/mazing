/* eslint-disable camelcase */
const tap = require('tap');
const _ = require('lodash');
const p = require('./../package.json');

const { Grid } = require('./../lib/index');

tap.test(p.name, (suite) => {
  suite.test('Grid', (g) => {
    g.test('constructor', (gC) => {
      const grid = new Grid({ name: 'x', min: -10, max: 10 }, { name: 'y', min: 0, max: 10 });

      gC.same(grid.dims[0].name, 'x');
      gC.same(grid.dims[0].min, -10);
      gC.same(grid.dims[0].max, 10);
      gC.same(grid.dims[1].name, 'y');
      gC.same(grid.dims[1].min, 0);
      gC.same(grid.dims[1].max, 10);

      gC.end();
    });

    g.test('flatten', (flat) => {
      flat.test('1d', (w1d) => {
        const grid = new Grid({ name: 'n', min: -4, max: 4 });

        w1d.same(grid.flatten({ n: -4 }), 0);
        w1d.same(grid.flatten({ n: -2 }), 2);
        w1d.same(grid.flatten({ n: 4 }), 8);

        w1d.end();
      });

      flat.test('whole 2d', (w2d) => {
        const grid = new Grid({ name: 'x', min: 1, max: 4 }, { name: 'y', min: 1, max: 4 });

        w2d.same(grid.flatten({ x: 1, y: 1 }), 0);
        w2d.same(grid.flatten({ x: 2, y: 2 }), 5);
        w2d.same(grid.flatten({ x: 1, y: 4 }), 12);
        w2d.same(grid.flatten({ x: 4, y: 1 }), 3);
        w2d.same(grid.flatten({ x: 4, y: 4 }), 15);
        w2d.end();
      });

      flat.test('whole3d', (w3d) => {
        const grid = new Grid({ name: 'x', min: 1, max: 4 },
          { name: 'y', min: 1, max: 4 },
          { name: 'z', min: 1, max: 4 });

        w3d.same(grid.flatten({ x: 1, y: 1, z: 1 }), 0);
        w3d.same(grid.flatten({ x: 2, y: 2, z: 1 }), 5);
        w3d.same(grid.flatten({ x: 1, y: 4, z: 1 }), 12);
        w3d.same(grid.flatten({ x: 4, y: 1, z: 1 }), 3);
        w3d.same(grid.flatten({ x: 4, y: 4, z: 1 }), 15);

        w3d.same(grid.flatten({ x: 1, y: 1, z: 4 }), 48);
        w3d.same(grid.flatten({ x: 2, y: 2, z: 4 }), 53);
        w3d.same(grid.flatten({ x: 1, y: 4, z: 4 }), 60);
        w3d.same(grid.flatten({ x: 4, y: 1, z: 4 }), 51);
        w3d.same(grid.flatten({ x: 4, y: 4, z: 4 }), 63);

        w3d.end();
      });

      flat.test('radial3d', (r3d) => {
        const grid = new Grid({ name: 'i', radius: 2 }, { name: 'j', radius: 3 }, { name: 'k', radius: 4 });

        r3d.same(grid.flatten({ i: -2, j: -3, k: -4 }), 0);

        r3d.same(grid.flatten({ i: -2, j: 3, k: -4 }), 30);
        r3d.same(grid.flatten({ i: 2, j: -3, k: -4 }), 4);
        r3d.same(grid.flatten({ i: 2, j: 3, k: -4 }), 34);

        r3d.same(grid.flatten({ i: -2, j: -3, k: 4 }), 280);
        r3d.same(grid.flatten({ i: -2, j: 3, k: 4 }), 310);
        r3d.same(grid.flatten({ i: 2, j: -3, k: 4 }), 284);

        r3d.same(grid.flatten({ i: 1, j: 1, k: 1 }), 198);

        r3d.same(grid.flatten({ i: 2, j: 3, k: 4 }), 314);

        r3d.end();
      });

      flat.end();
    });
    g.test('unflatten', (unflat) => {
      unflat.test('1d', (w1d) => {
        const grid = new Grid({ name: 'n', min: -4, max: 4 });
        w1d.same(grid.unflatten(0), { n: -4 });
        w1d.same(grid.unflatten(2), { n: -2 });
        w1d.same(grid.unflatten(8), { n: 4 });
        w1d.end();
      });

      unflat.test('whole 2d', (w2d) => {
        const grid = new Grid({ name: 'x', min: 1, max: 4 }, { name: 'y', min: 1, max: 4 });

        w2d.same(grid.unflatten(0), { x: 1, y: 1 });
        w2d.same(grid.unflatten(5), { x: 2, y: 2 });
        w2d.same(grid.unflatten(12), { x: 1, y: 4 });
        w2d.same(grid.unflatten(3), { x: 4, y: 1 });
        w2d.same(grid.unflatten(15), { x: 4, y: 4 });
        w2d.end();
      });

      unflat.test('radial3d', (r3d) => {
        const grid = new Grid({ name: 'i', radius: 2 }, { name: 'j', radius: 3 }, { name: 'k', radius: 4 });

        r3d.same(grid.unflatten(0), { i: -2, j: -3, k: -4 });

        r3d.same(grid.unflatten(30), { i: -2, j: 3, k: -4 });
        r3d.same(grid.unflatten(4), { i: 2, j: -3, k: -4 });
        r3d.same(grid.unflatten(34), { i: 2, j: 3, k: -4 });

        r3d.same(grid.unflatten(280), { i: -2, j: -3, k: 4 });
        r3d.same(grid.unflatten(310), { i: -2, j: 3, k: 4 });
        r3d.same(grid.unflatten(284), { i: 2, j: -3, k: 4 });

        r3d.same(grid.unflatten(198), { i: 1, j: 1, k: 1 });

        r3d.same(grid.unflatten(314), { i: 2, j: 3, k: 4 });

        r3d.end();
      });
      unflat.test('whole3d', (w3d) => {
        const grid = new Grid({ name: 'x', min: 1, max: 4 },
          { name: 'y', min: 1, max: 4 },
          { name: 'z', min: 1, max: 4 });

        w3d.same(grid.unflatten(0), { x: 1, y: 1, z: 1 });
        w3d.same(grid.unflatten(5), { x: 2, y: 2, z: 1 });
        w3d.same(grid.unflatten(12), { x: 1, y: 4, z: 1 });
        w3d.same(grid.unflatten(3), { x: 4, y: 1, z: 1 });
        w3d.same(grid.unflatten(15), { x: 4, y: 4, z: 1 });

        w3d.same(grid.unflatten(48), { x: 1, y: 1, z: 4 });
        w3d.same(grid.unflatten(53), { x: 2, y: 2, z: 4 });
        w3d.same(grid.unflatten(60), { x: 1, y: 4, z: 4 });
        w3d.same(grid.unflatten(51), { x: 4, y: 1, z: 4 });
        w3d.same(grid.unflatten(63), { x: 4, y: 4, z: 4 });

        w3d.end();
      });

      unflat.end();
    });

    g.test('store/set/get', (sg) => {
      sg.test('dense', (sgd) => {
        const grid = new Grid({ name: 'x', radius: 2 }, { name: 'y', size: 4 });
        grid.storage = 'dense';
        for (let x = -2; x <= 2; ++x) {
          for (let y = 0; y <= 4; ++y) {
            const str = `(${x},${y})`;
            grid.set({ x, y }, str);
          }
        }

        sgd.same(grid.store.join(' '),
          '(-2,0) (-1,0) (0,0) (1,0) (2,0) (-2,1) (-1,1) (0,1) (1,1) (2,1) (-2,2) (-1,2) (0,2) (1,2) (2,2) (-2,3) (-1,3) (0,3) (1,3) (2,3) (-2,4) (-1,4) (0,4) (1,4) (2,4)');

        sgd.end();
      });

      sg.test('sparse', (sgd) => {
        const grid = new Grid({ name: 'x', radius: 2 }, { name: 'y', size: 4 });
        grid.storage = 'sparse';
        for (let x = -2; x <= 2; ++x) {
          for (let y = 0; y <= 4; ++y) {
            const str = `(${x},${y})`;
            grid.set({ x, y }, str);
          }
        }

        const data = [];

        grid.store.forEach((v, k) => data.push([v, k]));

        const string = _.sortBy(data, ([v, k]) => k).map(([v, k]) => `${k}:${v}`).join(' ');

        sgd.same(
          string,
          '0:(-2,0) 1:(-1,0) 2:(0,0) 3:(1,0) 4:(2,0) 5:(-2,1) 6:(-1,1) 7:(0,1) 8:(1,1) 9:(2,1) 10:(-2,2) 11:(-1,2) 12:(0,2) 13:(1,2) 14:(2,2) 15:(-2,3) 16:(-1,3) 17:(0,3) 18:(1,3) 19:(2,3) 20:(-2,4) 21:(-1,4) 22:(0,4) 23:(1,4) 24:(2,4)',
        );
        sgd.end();
      });

      sg.end();
    });

    g.test('near', (n) => {
      const grid = new Grid({ name: 'x', radius: 4 },
        { name: 'y', radius: 4 });

      const neighbors = grid.near({ x: 2, y: 3 });
      n.same(neighbors,
        [{ x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 2, y: 2 },
          { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }]);

      const ordNeighbors = grid.near({ x: 2, y: 3 }, true);
      n.same(ordNeighbors, [{ x: 3, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 2 }]);
      n.end();
    });

    g.end();
  });

  suite.end();
});
