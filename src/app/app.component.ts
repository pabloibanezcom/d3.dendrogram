import { Component, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/Rx';

import { PhylogramOptions } from '../assets/phylogramOptions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('phylogram') phylogram;
  options: PhylogramOptions;
  data: any;
  clusters: Array<any>;
  selectedClusters: Array<any>;
  dataString: string;

  constructor(private http: Http) {
    this.options = {
      width: 600,
      //height: 500,
      labelHeight: 30,
      skipLabels: false,
      ratioLengthPropertyName: 'dist',
      namePropertyName: 'name'
    };
    http.get('assets/data.v4.json')
      .map(res => res.json())
      .subscribe(data => this.loadData(data),
      err => console.log(err));
    this.clusters = new Array<any>();
    this.selectedClusters = new Array<any>();
  }

  loadData(data: any) {
    this.data = data;
    this.dataString = JSON.stringify(data);
    this.renderData();
  }

  renderData() {
    this.data = JSON.parse(this.dataString);
    this.checkIfCluster(this.data);
  }

  private checkIfCluster(node: any) {
    if (node) {
      if (!node.children || node.children === []) {
        this.clusters.push(node);
      } else {
        for (let i = 0; i <= node.children.length; i++) {
          this.checkIfCluster(node.children[i]);
        }
      }
    }
  }

  toggleCluster(cluster: any) {
    cluster.isSelected = !cluster.isSelected;
    if (cluster.isSelected) {
      this.selectedClusters.push(cluster);
    } else {
      this.selectedClusters = this.selectedClusters.filter(item => item !== cluster);
    }
  }

  filterClusters() {
    this.filterData();
    console.log(this.data);
    //this.phylogram.hideClusters(this.selectedClusters);
  }

  private filterData() {
    console.log(this.data);
    this.data.children.forEach((node, i) => {
      this.checkAux(node);
    });
  }

  private checkAux(node: any) {
    if (node.children) {
      node.children.forEach((chilNode) => {
        this.checkAux(chilNode);
      });
    } else {
      const aux =  this.selectedClusters.find(x => x === node.name);
      if (!aux) {
        node = null;
      }
    }
  }
}
