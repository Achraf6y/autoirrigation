import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

export interface SensorData {
  Timestamp: string;
  Humidity: number;
  'Soil Moisture': number;
  Temperature: number;
  Luminosity: number;
  NeedsWatering: number; // Ensure this is either 0 or 1
}



@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private db: AngularFireDatabase) {}

  getSensorData(): Observable<SensorData[]> {
    return this.db.list<SensorData>('/SensorData').valueChanges();
  }
  
}
