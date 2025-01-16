import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-sensor-data',
  template: `
    <div *ngFor="let data of sensorData">
      <p>Timestamp: {{ data.Timestamp }}</p>
      <p>Temperature: {{ data.Temperature }} °C</p>
      <p>Humidity: {{ data.Humidity }} %</p>
      <p>Soil Moisture: {{ data['Soil Moisture'] }}</p>
      <p>Luminosity: {{ data.Luminosity }}</p>
      <p>Needs Watering: {{ data.NeedsWatering ? 'Yes' : 'No' }}</p>
      <hr />
    </div>
  `
})
export class SensorDataComponent implements OnInit {
  sensorData: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getSensorData().subscribe(data => {
      this.sensorData = data;
    });
  }
}
