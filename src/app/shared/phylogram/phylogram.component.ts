import { Component, OnInit, Input, ViewChild, OnChanges, ElementRef } from '@angular/core';

import { Phylogram } from '../../phylogram/phylogram';
import { PhylogramOptions } from '../../phylogram/phylogramOptions';

declare var d3: any;
@Component({
  selector: 'app-phylogram',
  templateUrl: './phylogram.component.html',
  styleUrls: ['./phylogram.component.css']
})

export class PhylogramComponent implements OnInit {
  @Input() data: any;
  @Input() options: PhylogramOptions;
  @ViewChild('phylogram') phylogramComponent: ElementRef;

  phylogram: Phylogram;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.data && this.options) {
      this.render();
    }
  }

  render() {
    this.phylogramComponent.nativeElement.innerHTML = '';
    //d3.phylogram.build('#phylogram', this.data, this.options);
    this.phylogram = new Phylogram('#phylogram', this.data, this.options);

  }

  hideClusters(clusters: Array<any>) {
    this.render();
    clusters.forEach((cluster) => {
      d3.phylogram.hideNodePath('n-' + cluster.name);
    });
  }

}
