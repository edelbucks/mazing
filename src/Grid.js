import lGet from 'lodash/get';
import inRange from 'lodash/inRange';
import isEqual from 'lodash/isEqual';
import reverse from 'lodash/reverse';
import { Subject, BehaviorSubject } from 'rxjs';
import permuter from 'js-permuter';
import flatten from 'lodash/flatten';
import Dimension from './Dimension';

/**
 * a 2d "space".
 * maxX and maxY are the legal bounds of points. ;
 * if zero, it is assumed to be a boundless region -- a scenario not handled by the current codebase.
 *
 * there are two orientations: 0..maxX x 0..maxY (non radial)
 * and -maxX...maxX x -maxY...maxY.
 *
 * Grid allows you to write arbitrary name value properties to coordinates.
 * For speed, they are written into a log and only collected when a property is polled for.
 * this means for instance the log can have some old/overwritten values in it.
 */
export default class Grid {
  constructor(dimensions, ...dims) {
    this.dims = [];
    if (!Array.isArray(dimensions)) {
      [dimensions, ...dims].forEach((d, i) => this.addDim(d, i));
    } else {
      dimensions.forEach((d, i) => this.addDim(d, i));
    }
    this.storage = 'sparse';
  }

  /**
   * determines the validity of a point;
   * that is, the point has all proper coordinate keys
   * AND is inside the grid space.
   *
   * note only tests for existence and validity
   * of known dimensions; extra data is ignored.
   *
   * @param point {Object}
   */
  validPoint(point) {
    if (!this.validCoordinate(point)) return false;
    for (let i = 0; i < this.dims.length; ++i) {
      const dim = this.dims[i];
      if (!this.dims[i].inRange(point[dim.name])) {
        return false;
      }
    }

    return true;
  }

  /**
   * tests to see if a point has all the proper keys.
   * @param point
   * @returns {boolean}
   */
  validCoordinate(point) {
    if (typeof point !== 'object') return false;

    return this.dimNames.reduce((valid, name) => valid && name in point, true);
  }

  get dims() {
    if (!this._dims) {
      this._dims = [];
    }
    return this._dims;
  }

  get dimNames() {
    return this.dims.map(({ name }) => name);
  }

  set dims(data) {
    this._dims = [];
  }

  get seedFunction() {
    return this._seedFunction;
  }

  set seedFunction(fn) {
    this._seedFunction = fn;
  }

  get storage() {
    return this._storage;
  }

  set storage(value) {
    this._storage = value;
    let storage = [];
    switch (value) {
      case 'sparse':
        storage = new Map();
        break;

      case 'dense':
        storage = [];
    }

    this._store = storage;
  }

  get store() {
    return this._store;
  }

  get center() {
    return this.dims.reduce((point, dim) => ({ ...point, ...dim.center }), {});
  }

  get(pointOrFlat) {
    let index = pointOrFlat;
    if (typeof index !== 'number') {
      index = this.flatten(pointOrFlat);
    }

    if (index === null) {
      return null;
    }

    if (this.storage === 'sparse') {
      if (this.seedFunction && !this._store.has(index)) {
        if (this.seedFunction) {
          this._store.set(index, this.seedFunction(index, this));
        }
      }
      return this._store.get(index);
    }
    if (this.storage === 'dense') {
      if (this.seedFunction && ((this._store.length < index) || (typeof this._store[index] === 'undefined'))) {
        this._store[index] = this.seedFunction(index, this);
      }
      return this._store[index];
    }
    return null;
  }

  set(pointOrFlat, value) {
    let coord = pointOrFlat;
    let index = pointOrFlat;
    if (typeof index !== 'number') {
      index = this.flatten(pointOrFlat);
    } else {
      coord = null;
    }

    if (index === null) {
      return;
    }

    if (this.storage === 'sparse') {
      this._store.set(index, value);
    }

    if (this.storage === 'dense') {
      this._store[index] = value;
    }

    const prev = this.get(index);
    if (!isEqual(prev, coord)) {
      if (this._changes) {
        if (!coord) {
          coord = this.unflatten(index);
        }
        this.changes.next({
          coord,
          value,
          prev,
          grid: this,
        });
      }
      if (this._subject) {
        this._subject.next(this);
      }
    }
  }

  near(point, ordinal = false) {
    if (!this.validCoordinate(point)) return [];

    if (typeof point === 'number') {
      point = this.unflatten(point);
    }

    if (ordinal) {
      return flatten(this.dimNames.map((name) => (
        [
          { ...point, [name]: (point[name] + 1) },
          { ...point, [name]: (point[name] - 1) },
        ]
      )));
    }

    const extents = this.dimNames.map((name) => ({
      [name]: [point[name] - 1, point[name], point[name] + 1],
    })).reduce((options, option) => Object.assign(options, option), {});
    const near = permuter.permute(extents);
    return near;
  }

  addDim(props, i = 0) {
    this.dims.push(new Dimension(props, this, i));
  }

  weight(i) {
    if (i >= 0) {
      return this.dims[i].extent * this.weight(i - 1);
    }
    return 1;
  }

  flatten(point) {
    return this.dims.reduce((flatValue, dim, i) => {
      if (flatValue === null) {
        return flatValue;
      }
      const { name, min } = dim;
      const value = (name in point ? point[name] : min);
      if (!dim.inRange(value)) {
        return null;
      }
      return flatValue + ((value - min) * this.weight(i - 1));
    }, 0);
  }

  unflatten(flattened) {
    const result = reverse([...this.dims])
      .reduce(([point, flat], dim, i) => {
        if (point === null) {
          return [null];
        }
        const { name, min } = dim;
        if (i === (this.dims.length - 1)) {
          //  console.log('flattening last ', flattened, 'flat = ', flat, 'dim ', name, '=(offset)', flat);
          return [{ ...point, [name]: flat + min }, 0];
        }

        const weightIndex = this.dims.length - i - 2;
        const weight = this.weight(weightIndex);
        const value = Math.floor(flat / weight);
        //  console.log('flattening ', flattened, 'flat = ', flat, 'dim ', name, '=(offset)', value, 'from weight', weight);
        return [{ ...point, [name]: value + min }, flat - (value * weight)];
      }, [{}, flattened]);

    return result[0];
  }

  /**
   *
   * @returns {Subject}
   */
  get changes() {
    if (!this._changes) {
      this._changes = new Subject();
    }

    return this._changes;
  }

  /**
   *
   * @returns {BehaviorSubject<Grid>}
   */
  subject() {
    if (!this._subject) {
      this._subject = new BehaviorSubject(this);
    }
    return this._subject;
  }
}
