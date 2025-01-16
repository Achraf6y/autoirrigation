import { Component, OnInit } from '@angular/core';
import { DataService, SensorData } from '../../services/data.service';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.css']
})
export class TemperatureComponent implements OnInit {
  temperatureData: { timestamp: string; temperature: number; needsWatering: number }[] = [];
  needsWatering: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getSensorData().subscribe((data: SensorData[]) => {
      this.temperatureData = data.map(item => ({
        timestamp: item.Timestamp,
        temperature: item.Temperature,
        needsWatering: item.NeedsWatering
      }));
      this.needsWatering = this.temperatureData.some(d => d.needsWatering === 1);
    });
  }
}
