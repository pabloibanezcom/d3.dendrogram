
if (!d3) { throw "d3 wasn't included!" };
(function () {
  d3.phylogram = {}
  d3.phylogram.rightAngleDiagonal = function () {
    var projection = function (d) { return [d.y, d.x]; }

    var path = function (pathData) {
      return "M" + pathData[0] + ' ' + pathData[1] + " " + pathData[2];
    }

    function diagonal(diagonalPath, i) {
      var source = diagonalPath.parent,
        target = diagonalPath,
        pathData = [source, { x: target.x, y: source.y }, target];
      pathData = pathData.map(projection);
      return path(pathData)
    }

    return diagonal;
  }

  d3.phylogram.generateHeight = function (rootNode, options) {
    if (!options.labelHeight) {
      return null;
    }
    d3.phylogram.labelNodes = 0;
    checkNode(rootNode);
    function checkNode(node) {
      if (!node.children || !node.children.length) {
        d3.phylogram.labelNodes++;
      } else {
        node.children.forEach(checkNode);
      }
    }
    return d3.phylogram.labelNodes * options.labelHeight;
  }

  d3.phylogram.generateDimensions = function (selector, data, options) {
    let w = options.width || d3.select(selector).style('width') || d3.select(selector).attr('width');
    let h = options.height || d3.phylogram.generateHeight(data, options) ||
      d3.select(selector).style('height') || d3.select(selector).attr('height');
    return { w: parseInt(w), h: parseInt(h) };
  }

  d3.phylogram.transformRootNode = function (rootNode, d) {
    var tree = d3.cluster()
      .size([d.h, d.w])
      .separation(function (a, b) { return (a.parent == b.parent ? 1 : 1) });
    return tree(d3.hierarchy(rootNode));
  }

  d3.phylogram.createVis = function (selector, d) {
    return d3.select(selector).append("svg:svg")
      .attr("width", d.w + 300)
      .attr("height", d.h + 30)
      .append("svg:g")
      .attr("transform", "translate(20, 20)");
  }

  d3.phylogram.getDepth = function (rootNode) {
    d3.phylogram.depth = 0;
    checkNode(rootNode);
    function checkNode(node) {
      if (node.depth > d3.phylogram.depth) {
        d3.phylogram.depth = node.depth;
      }
      if (node.children) {
        node.children.forEach(checkNode);
      }
    }
  }

  d3.phylogram.applyLengthRatio = function (rootNode, d, options) {
    const ratioLengthProperty = options.ratioLengthPropertyName || 'ratioLength';
    const fullScale = rootNode.data[ratioLengthProperty];
    applyLengthRatioToNode(rootNode);

    function applyLengthRatioToNode(node) {
      // Calculate length
      if (node.parent) {
        node.data[ratioLengthProperty] = node.data[ratioLengthProperty] || 0;
        let length = node.parent.data[ratioLengthProperty] - node.data[ratioLengthProperty];
        node.y = calculateYPosition(length, node.parent.y);
      }
      if (node.children && node.children.length) {
        node.children.forEach(applyLengthRatioToNode);
      }
    }

    function getAncestryLength(node) {
      let result = 0;
      getParentLength(node);
      function getParentLength(node) {
        if (node.parent) {
          result += node.parent.data[ratioLengthProperty];
          getParentLength(node.parent);
        }
      }
      return result;
    }

    function calculateYPosition(length, parentY) {
      return parentY + (d.w * (length / fullScale));
    }
  }

  d3.phylogram.drawPaths = function (vis, rootNode) {
    var diagonal = d3.phylogram.rightAngleDiagonal();
    var link = vis.selectAll("path.link")
      .data(rootNode.descendants().slice(1))
      .enter().append("svg:path")
      .attr("class", "link")
      .attr("d", diagonal)
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", "3px");
  }

  d3.phylogram.drawLastNodes = function (vis, rootNode) {
    vis.selectAll("g.node")
      .data(rootNode.descendants().slice(1))
      .enter().append("svg:g")
      .attr("class", function (n) {
        if (n.children) {
          if (n.depth == 0) {
            return "root node"
          } else {
            return "inner node"
          }
        } else {
          return "leaf node"
        }
      })
      .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
  }

  d3.phylogram.styleTreeNodes = function (vis) {
    vis.selectAll('g.leaf.node');

    vis.selectAll('link')
      .append('svg:circle')
      .attr("r", 4.5)
      .attr('fill', 'steelblue')
      .attr('stroke', '#369')
      .attr('stroke-width', '2px');
  }

  d3.phylogram.appendLabels = function (vis, options) {
    if (options.skipLabels) {
      return;
    }
    const nameProperty = options.namePropertyName || 'name';

    vis.selectAll('g.leaf.node').append("svg:text")
      .attr("dx", 8)
      .attr("dy", 3)
      .attr("text-anchor", "start")
      .attr('font-family', 'Roboto, Arial, sans-serif')
      .attr('font-size', '14px')
      .attr('fill', 'black')
      .text(function (d) { return d.data[nameProperty]; });
  }

  d3.phylogram.build = function (selector, data, options) {
    options = options || {}

    const d = d3.phylogram.generateDimensions(selector, data, options);
    const vis = d3.phylogram.createVis(selector, d);
    const rootNode = d3.phylogram.transformRootNode(data, d);

    d3.phylogram.getDepth(rootNode);
    d3.phylogram.applyLengthRatio(rootNode, d, options);
    d3.phylogram.drawPaths(vis, rootNode);
    d3.phylogram.drawLastNodes(vis, rootNode);
    //d3.phylogram.styleTreeNodes(vis)
    d3.phylogram.appendLabels(vis, options);
  }

}());