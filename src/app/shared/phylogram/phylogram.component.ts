import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/Rx';

declare var d3: any;
@Component({
  selector: 'app-phylogram',
  templateUrl: './phylogram.component.html',
  styleUrls: ['./phylogram.component.css']
})

export class PhylogramComponent implements OnInit {
  data: any;

  constructor(private http: Http) {
    http.get('assets/data.v4.json')
      .map(res => res.json())
      .subscribe(data => this.render(data),
      err => console.log(err));
  }

  ngOnInit() {
  }

  render(data: any) {
    this.data = data;
    d3.phylogram.build('#phylogram', this.data, {
      width: 950,
      //height: 500,
      labelHeight: 30,
      skipLabels: false,
      alignLabels: true,
      ratioLengthPropertyName: 'substitutability',
      namePropertyName: 'name'
    });
  }

}
