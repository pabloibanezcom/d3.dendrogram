import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AccordionModule } from 'ng2-bootstrap/accordion';

import { AppComponent } from './app.component';
import { PhylogramComponent } from './shared/phylogram/phylogram.component';

@NgModule({
  declarations: [
    AppComponent,
    PhylogramComponent
  ],
  imports: [
    AccordionModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
