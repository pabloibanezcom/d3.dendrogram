import { Component, OnInit, Input, ViewChild, OnChanges, ElementRef } from '@angular/core';

declare var d3: any;
@Component({
  selector: 'app-phylogram',
  templateUrl: './phylogram.component.html',
  styleUrls: ['./phylogram.component.css']
})

export class PhylogramComponent implements OnInit {
  @Input() data: any;
  @Input() options: any;
  @ViewChild('phylogram') phylogram: ElementRef;

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
    this.phylogram.nativeElement.innerHTML = '';
    d3.phylogram.build('#phylogram', this.data, this.options);
  }

}
