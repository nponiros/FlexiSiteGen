'use strict';

const DepGraph = require('dependency-graph').DepGraph;

class DependencyGraph {
  constructor() {
    this._graph = new DepGraph();
  }

  addNode(name, fn, dependsOn) {
    const nodeData = {
      fn,
      dependsOn
    };
    this._graph.addNode(name, nodeData);
  }

  calculateDependencies() {
    const allNodeNames = this._graph.overallOrder(true);

    allNodeNames.forEach((nodeName) => {
      const nodeData = this._graph.getNodeData(nodeName);
      if (nodeData.dependsOn) {
        nodeData.dependsOn.assets.forEach((assetName) => {
          // nodeName depends of assetName
          this._graph.addDependency(assetName, nodeName);
        });

        nodeData.dependsOn.contents.forEach((contentName) => {
          // nodeName depends of contentName
          this._graph.addDependency(contentName, nodeName);
        });
      }
    });
  }
}

module.exports = DependencyGraph;
