
if (!d3) { throw "d3 wasn't included!" };
(function () {
  d3.phylogram = {}
  d3.phylogram.rightAngleDiagonal = function () {
    var projection = function (d) { return [d.y, d.x]; }

    var path = function (pathData) {
      return "M" + pathData[0] + ' ' + pathData[1] + " " + pathData[2];
    }

    function diagonal(diagonalPath, i) {
      console.log("SOURCE - " + diagonalPath.source.x + ', ' + diagonalPath.source.y
        + " || TARGET - " + diagonalPath.target.x + ', ' + diagonalPath.target.y);
      var source = diagonalPath.source,
        target = diagonalPath.target,
        pathData = [source, { x: target.x, y: source.y }, target];
      pathData = pathData.map(projection);
      return path(pathData)
    }

    return diagonal;
  }


  d3.phylogram.styleTreeNodes = function (vis) {
    vis.selectAll('g.leaf.node');

    vis.selectAll('g.root.node')
      .append('svg:circle')
      .attr("r", 4.5)
      .attr('fill', 'steelblue')
      .attr('stroke', '#369')
      .attr('stroke-width', '2px');
  }

  function scaleBranchLengths(nodes, w) {
    // Visit all nodes and adjust y pos width distance metric
    var visitPreOrder = function (root, callback) {
      callback(root)
      if (root.children) {
        for (var i = root.children.length - 1; i >= 0; i--) {
          visitPreOrder(root.children[i], callback)
        };
      }
    }
    visitPreOrder(nodes[0], function (node) {
      node.rootDist = (node.parent ? node.parent.rootDist : 0) + (node.data.length || 0)
    })
    var rootDists = nodes.map(function (n) { return n.rootDist; });
    var yscale = d3.scale.linear()
      .domain([0, d3.max(rootDists)])
      .range([0, w]);
    visitPreOrder(nodes[0], function (node) {
      node.y = yscale(node.rootDist)
    })
    return yscale
  }


  d3.phylogram.build = function (selector, nodes, options) {
    options = options || {}
    var w = options.width || d3.select(selector).style('width') || d3.select(selector).attr('width'),
      h = options.height || d3.select(selector).style('height') || d3.select(selector).attr('height'),
      w = parseInt(w),
      h = parseInt(h);
    var tree = d3.layout.cluster()
      .size([h, w])
      .sort(function (node) { return node.children ? node.children.length : -1; })
      .children(options.children || function (node) {
        return node.elements
      });
    //;
    var diagonal = options.diagonal || d3.phylogram.rightAngleDiagonal();
    var vis = options.vis || d3.select(selector).append("svg:svg")
      .attr("width", w + 300)
      .attr("height", h + 30)
      .append("svg:g")
      .attr("transform", "translate(20, 20)");
    var nodes = tree(nodes);
    //var nodes = nodes; 

    if (options.skipBranchLengthScaling) {
      var yscale = d3.scale.linear()
        .domain([0, w])
        .range([0, w]);
    } else {
      var yscale = scaleBranchLengths(nodes, w)
    }

    var link = vis.selectAll("path.link")
     .data(tree.links(nodes))
      //.data(generateDiagonalNodes())
      .enter().append("svg:path")
      .attr("class", "link")
      .attr("d", diagonal)
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", "4px");

    var node = vis.selectAll("g.node")
      .data(nodes)
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

    d3.phylogram.styleTreeNodes(vis)

    function generateDiagonalNodes() {

      let result = [];
      //result.push(generateDiagonalNode(0, 82.89473684210527, 23.684210526315788, 250))
      return result;

      function generateDiagonalNode(sourceX, sourceY, targetX, targetY) {
        return {
          source: {
            x: sourceX,
            y: sourceY
          },
          target: {
            x: targetX,
            y: targetY
          }
        };
      }

    }

    if (!options.skipLabels) {

      vis.selectAll('g.leaf.node').append("svg:text")
        .attr("dx", 8)
        .attr("dy", 3)
        .attr("text-anchor", "start")
        .attr('font-family', 'Roboto, Arial, sans-serif')
        .attr('font-size', '14px')
        .attr('fill', 'black')
        .text(function (d) { return d.data.name; });
    }

    return { tree: tree, vis: vis }
  }

}());