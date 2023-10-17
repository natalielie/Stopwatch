import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from '@angular/material/button';

import { AppComponent } from "./app.component";

@NgModule({
  imports: [
    BrowserModule, 
    FormsModule,
    MatButtonModule],

  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
