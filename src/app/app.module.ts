import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { TemperatureComponent } from './components/temperature/temperature.component';
import { HumidityComponent } from './components/humidity/humidity.component';
import { SoilMoistureComponent } from './components/soil-moisture/soil-moisture.component';
import { LightLevelComponent } from './components/light-level/light-level.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';

const routes: Routes = [
  { path: 'temperature', component: TemperatureComponent },
  { path: 'humidity', component: HumidityComponent },
  { path: 'soil-moisture', component: SoilMoistureComponent },
  { path: 'light-level', component: LightLevelComponent },
  { path: '', redirectTo: '/temperature', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    TemperatureComponent,
    HumidityComponent,
    SoilMoistureComponent,
    LightLevelComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
