import lGet from 'lodash/get';
import inRange from 'lodash/inRange';

export default class Dimension {
  constructor(props, grid, index) {
    this.grid = grid;
    this.name = lGet(props, 'name', index);
    if ('radius' in props) {
      this.max = lGet(props, 'radius');
      this.min = -this.max;
    } else
    if ('size' in props) {
      this.max = lGet(props, 'size');
      this.min = 0;
    } else {
      this.min = lGet(props, 'min', Number.NEGATIVE_INFINITY);
      this.max = lGet(props, 'max', Number.POSITIVE_INFINITY);
    }
  }

  inRange(value) {
    return value <= this.max && value >= this.min;
  }

  get extent() {
    return 1 + this.max - this.min;
  }
}
