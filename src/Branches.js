import sample from "lodash/sample";
import difference from "lodash/difference";
import pad from "lodash/pad";
import random from "lodash/random";
import range from "lodash/range";
import Grid from "./Grid";

const ALPHABET = `abcdefghijklmnoparstuvwxyz${"abcdefghijklmnoparstuvwxyz".toUpperCase()}`.split(
  ""
);

class Node {
  /**
   *
   * @param x {int}
   * @param y {int}
   * @param branches {Branches}
   * @param parent {Node}
   */
  constructor(x, y, branches, parent) {
    this.branches = branches;
    this.x = x;
    this.y = y;
    this.id = sample(ALPHABET);
    this.parent = parent;
  }
}

export default class Branches {
  constructor(width, height, minLength, maxLength = 0) {
    this._grid = new Grid(
      { name: "x", size: width },
      { name: "y", size: height }
    );
    this.minLength = minLength;
    this.maxLength = maxLength;
    this.nodes = new Map();
  }

  newId(prefix = "") {
    const used = [];
    this.nodes.forEach(({ id }) => used.push(id));
    const available = difference(ALPHABET.map(id => prefix + id), used);
    if (!available.length) {
      const nextPI = ALPHABET.indexOf(prefix) + 1;
      return this.newId(ALPHABET[nextPI]);
    }
    return sample(available);
  }

  get grid() {
    return this._grid;
  }

  seed(nodes) {
    (nodes || [this.grid.center]).forEach((node, i) => {
      this.addNode(node);
    });
  }

  diff(node, near) {
    return this.grid.dimNames.reduce(
      (d, dim) => ({ ...d, [dim]: near[dim] - node[dim] }),
      {}
    );
  }

  sum(node, vector) {
    return this.grid.dimNames.reduce(
      (d, dim) => ({ ...d, [dim]: vector[dim] + node[dim] }),
      {}
    );
  }

  drawStem(node, vector) {
    if (!this._grid.validPoint(node)) {
      //  console.log('stopping branch prematurely before ', next);
      return false;
    }
    // console.log('drawing stem:', node, vector);
    let lastValidPoint = null;
    let next = this.sum(node, vector);
    if (!this.grid.validPoint(next)) return false;
    const stemLength = random(this.minLength, this.maxLength);
    for (let i = 0; i < stemLength; ++i) {
      if (this.grid.validPoint(next) && !this.grid.get(next)) {
        this.grid.set(next, node.id);
      } else {
        //   console.log('loop- stopping stem at occupied', next);
        break;
      }
      lastValidPoint = next;
      next = this.sum(next, vector);
    }
    // console.log('adding a node at ', node);
    this.addNode(lastValidPoint, node);
    return true;
  }

  addNode({ x, y }, parent) {
    if (!this.grid.validPoint({ x, y })) {
      return;
    }
    const node = new Node(x, y, this, parent);
    const index = this._grid.flatten(node);

    // console.log('adding node at ', x, y, ';id = ', node.id, '/', index);
    if (!this.nodes.has(index)) {
      this.nodes.set(index, node);
      this.grid.set(node, node.id);
    }
  }

  branchNode(node) {
    const neighbors = this._grid
      .near(node, true)
      .filter(
        point =>
          !point.done && this.grid.validPoint(point) && !this.grid.get(point)
      );
    if (!neighbors.length) {
      node.done = true;
      return;
    }
    let stemFound = false;
    neighbors.forEach(near => {
      if (this.drawStem(node, this.diff(node, near))) {
        stemFound = true;
      }
    });
    if (!stemFound) node.done = true;
  }

  cycle() {
    const activeNodes = Array.from(this.nodes.values()).filter(
      node => !node.done
    );
    // console.log('active nodes:', activeNodes);
    if (!activeNodes.length) {
      return false;
    }
    activeNodes.forEach(node => this.branchNode(node));
    return true;
  }

  expand() {
    this.nodes.forEach(node => {
      if (!node.done) {
        this.branchNode(node);
      }
    });
  }

  toString() {
    const rows = [];
    const head = [];
    for (let x = this.grid.dims[0].min; x < this.grid.dims[0].max; ++x) {
      head.push(pad(x, 4));
    }
    rows.push(head.join(" | "));
    for (let y = this.grid.dims[1].min; y < this.grid.dims[1].max; ++y) {
      const row = [];
      for (let x = this.grid.dims[0].min; x < this.grid.dims[0].max; ++x) {
        row.push(pad(`${this.grid.get({ x, y }) || ""}`, 4));
      }
      rows.push(row.join(" | "));
    }
    return rows.join("\n");
  }
}
