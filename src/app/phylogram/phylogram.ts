import * as d3 from 'd3';
import { HierarchyPointNode } from 'd3';

import { PhylogramOptions } from './phylogramOptions';

export class Phylogram {

    labelNodes: number;
    depth: number;
    vis: any;

    constructor(selector: string, data: any, options: PhylogramOptions) {
        const d = this.generateDimensions(selector, data, options);
        const vis = this.createVis(selector, d);
        const rootNode = this.transformRootNode(data, d);

        this.getDepth(rootNode);
        this.applyLengthRatio(rootNode, d, options);
        this.drawPaths(vis, rootNode);
        this.drawLastNodes(vis, rootNode);
        this.styleTreeNodes(vis);
        this.appendLabels(vis, options);
        this.vis = vis;
    }

    private rightAngleDiagonal() {
        const projection = function (d) { return [d.y, d.x]; };

        const path = function (pathData) {
            return 'M' + pathData[0] + ' ' + pathData[1] + ' ' + pathData[2];
        };

        function diagonal(diagonalPath, i) {
            const source = diagonalPath.parent,
                target = diagonalPath;
            let pathData = [source, { x: target.x, y: source.y }, target];
            pathData = pathData.map(projection);
            return path(pathData);
        }

        return diagonal;
    }

    private generateHeight(rootNode: any, options: PhylogramOptions): number {
        if (!options.labelHeight) {
            return null;
        }
        this.labelNodes = 0;
        this.checkLabelNodes(rootNode);
        return this.labelNodes * options.labelHeight;
    }

    private checkLabelNodes(node: any) {
        if (!node.children || !node.children.length) {
            this.labelNodes++;
        } else {
            for (const child of node.children) {
                this.checkLabelNodes(child);
            }
        }
    }

    private generateDimensions(selector: string, data: any, options: any) {
        const w = options.width || d3.select(selector).style('width') || d3.select(selector).attr('width');
        const h = options.height || this.generateHeight(data, options) ||
            d3.select(selector).style('height') || d3.select(selector).attr('height');
        return { w: parseInt(w), h: parseInt(h) };

    }

    private transformRootNode(rootNode: any, d: any): HierarchyPointNode<{}> {
        const tree = d3.cluster()
            .size([d.h, d.w])
            .separation(function (a, b) { return (a.parent === b.parent ? 1 : 1); });
        return tree(d3.hierarchy(rootNode));
    }

    private createVis(selector: string, d: any) {
        return d3.select(selector).append('svg:svg')
            .attr('width', d.w + 100)
            .attr('height', d.h + 30)
            .attr('style', 'width: 100%')
            .append('svg:g')
            .attr('transform', 'translate(20, 20)');
    }

    private getDepth(rootNode: HierarchyPointNode<{}>) {
        this.depth = 0;
        this.checkDepthNodes(rootNode);
    }

    private checkDepthNodes(node) {
        if (node.depth > this.depth) {
            this.depth = node.depth;
        }
        if (node.children) {
            for (const child of node.children) {
                this.checkDepthNodes(child);
            }
        }
    }

    private applyLengthRatio(rootNode: HierarchyPointNode<{}>, d: any, options: PhylogramOptions) {
        const ratioLengthProperty = options.ratioLengthPropertyName || 'ratioLength';
        const fullScale = rootNode.data[ratioLengthProperty];
        applyLengthRatioToNode(rootNode);

        function applyLengthRatioToNode(node) {
            // Calculate length
            if (node.parent) {
                node.data[ratioLengthProperty] = node.data[ratioLengthProperty] || 0;
                const length = node.parent.data[ratioLengthProperty] - node.data[ratioLengthProperty];
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

    private drawPaths(vis: any, rootNode: HierarchyPointNode<{}>): void {
        const diagonal = this.rightAngleDiagonal();
        function createClass(node: any) {
            return 'link n-' + node.data.name.replace(' ', '-');
        }

        vis.selectAll('path.link')
            .data(rootNode.descendants().slice(1))
            .enter().append('svg:path')
            .attr('class', createClass)
            .attr('d', diagonal)
            .attr('fill', 'none')
            .attr('stroke', '#aaa')
            .attr('stroke-width', '3px');
        vis.selectAll('.link').enter().append('svg:circle')
            .attr('r', 4.5)
            .attr('fill', 'steelblue')
            .attr('stroke', '#369')
            .attr('stroke-width', '2px');
    }

    private drawLastNodes(vis: any, rootNode: HierarchyPointNode<{}>): void {
        vis.selectAll('g.node')
            .data(rootNode.descendants().slice(1))
            .enter().append('svg:g')
            .attr('class', function (n) {
                if (n.children) {
                    if (n.depth === 0) {
                        return 'root node';
                    } else {
                        return 'inner node';
                    }
                } else {
                    return 'leaf node';
                }
            })
            .attr('transform', function (d) { return 'translate(' + d.y + ',' + d.x + ')'; });
    }

    private styleTreeNodes(vis: any): void {
        vis.selectAll('g.leaf.node');

        vis.selectAll('link')
            .append('svg:circle')
            .attr('r', 4.5)
            .attr('fill', 'steelblue')
            .attr('stroke', '#369')
            .attr('stroke-width', '2px');
    }

    private appendLabels(vis: any, options: PhylogramOptions): void {
        if (options.skipLabels) {
            return;
        }
        const nameProperty = options.namePropertyName || 'name';

        vis.selectAll('g.leaf.node').append('svg:text')
            .attr('dx', 8)
            .attr('dy', 3)
            .attr('text-anchor', 'start')
            .attr('font-family', 'Roboto, Arial, sans-serif')
            .attr('font-size', '14px')
            .attr('fill', 'black')
            .text(function (d) { return d.data[nameProperty]; });
    }

}