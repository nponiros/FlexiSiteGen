'use strict';

const ProgressBar = require('progress');

function create() {
  const middleware = [];
  let current = 0;
  // Start with 2 for the bar to display on execute
  // and for the last next call
  let totalTicks = 2;

  let bar;
  function next(call) {
    return function (data) {
      bar.tick();
      current++;
      if (current === totalTicks - 1) {
        bar.tick();
      } else {
        call(data, next(middleware[current]));
      }
    };
  }

  return {
    use(fn) {
      totalTicks = totalTicks + 1;
      middleware.push(fn);
    },
    execute(data) {
      bar = new ProgressBar('Processing [:bar] :percent :elapseds', { total: totalTicks });
      bar.tick();
      next(middleware[0])(data);
    },
  };
}

module.exports = create;
