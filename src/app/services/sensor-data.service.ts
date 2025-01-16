import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Import map operator

export interface SensorData {
  labels: string[];
  data: number[];
}

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  constructor(private http: HttpClient) {}

  getData(sensorType: 'humidity' | 'luminosity' | 'temperature'): Observable<SensorData> {
    return this.http.get<{ [key: string]: SensorData }>('/assets/my-data.json').pipe(
      map(response => response[sensorType]) // Extract the specific sensor data
    );
  }
}
