var vis = require('vis');
var React = require('react');
var uuid = require('uuid');

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

  changeMode: function(){
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
      layout: {
        hierarchical: {
          direction: "UD",
          sortMethod: "directed"
        }
      },
      interaction: {dragNodes :true},
      physics: {
        enabled: false
      },

      edges: {
        color: '#000000',
        width: 0.5,
        arrowScaleFactor: 100,
        style: "arrow",
        arrows: "to",
        dashes: false
      }
    };

    var network = new vis.Network(container, this.props.graph, options);
  }

});
module.exports = Graph;