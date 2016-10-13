var vis = require('vis');
var React = require('react');
var uuid = require('uuid');
import './Graph.less';

var Graph = React.createClass({
  getDefaultProps: function() {
    return {
      graph: {},
      identifier: uuid.v4(),
      style: {
        width: "100%",

      }
    };
  },

  render: function() {
    return React.createElement("div", {
      onDoubleClick: this.changeMode,
      id: this.props.identifier,
      style: this.props.style
    }, this.props.identifier);
  },

  changeMode: function() {
    this.updateGraph()
  },

  componentDidMount: function() {
    this.updateGraph();
  },

  componentDidUpdate: function() {
    this.updateGraph();
  },

  updateGraph: function() {
    // Container
    var container = document.getElementById(this.props.identifier);

    // Options
    var options = {
      nodes: {
        shape: 'dot',
        scaling: {
          min: 10,
          max: 30
        },
        font: {
          size: 30,
          face: 'Tahoma'
        }
      },
      edges: {
        width: 0.15,
        color: {
          inherit: 'from'
        },
        smooth: {
          type: 'continuous'
        },
        arrows: "to",
      },
      interaction: {
        dragNodes: true,
        navigationButtons: true,
        keyboard: true,
      },
      physics: {
        stabilization: false,
        barnesHut: {
          gravitationalConstant: -60000,
          springConstant: 0.0008,
          springLength: 800,
        }
      },
      interaction: {
        tooltipDelay: 200,
        dragNodes: true,
        navigationButtons: true,
        hideEdgesOnDrag: true
      }
    };
    var network = new vis.Network(container, this.props.graph, options);
  }

});
module.exports = Graph;