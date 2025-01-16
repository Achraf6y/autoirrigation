import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

export interface SensorData {
  Timestamp: string;
  Temperature: number;
  Humidity: number;
  'Soil Moisture': number;
  Luminosity: number;
  NeedsWatering: number;
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
