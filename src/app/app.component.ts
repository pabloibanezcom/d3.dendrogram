import { Component } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/Rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  options: any;
  data: any;
  dataString: string;

  constructor(private http: Http) {
    this.options = {
      width: 700,
      //height: 500,
      labelHeight: 30,
      skipLabels: false,
      ratioLengthPropertyName: 'dist',
      namePropertyName: 'name'
    };
    http.get('assets/big-JSON.json')
      .map(res => res.json())
      .subscribe(data => this.loadData(data),
      err => console.log(err));
  }

  loadData(data: any) {
    this.data = data;
    this.dataString = JSON.stringify(data);
    this.renderData();
  }

  renderData() {
    this.data = JSON.parse(this.dataString);
  }
}
