'use strict';

class DB {
  constructor() {
    this.db = new Map();
  }

  has(key) {
    return this.db.has(key);
  }

  get(key) {
    return this.db.get(key);
  }

  set(key, data) {
    this.db.set(key, data);
  }
}

module.exports = DB;
