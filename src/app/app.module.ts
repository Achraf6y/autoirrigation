import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SensorDataComponent } from './components/sensor-data/sensor-data.component';
import { DataService } from './services/data.service';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';

import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    SensorDataComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    RouterModule.forRoot([]) // Ensure this is present
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }

