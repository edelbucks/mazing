/* eslint-disable camelcase */
const tap = require('tap');
const _ = require('lodash');
const p = require('./../package.json');

const { Branches } = require('./../lib/index');

tap.test(p.name, (suite) => {
  suite.test('Branches', (b) => {
    const br = new Branches(20, 20, 5, 5);
    br.seed();

    do {
    } while (br.cycle());

    console.log(br.toString());
    // the "test" is that the cycle eventually ends...
    b.end();
  });
  suite.end();
});
