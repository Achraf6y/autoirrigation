import { Component, OnInit } from '@angular/core';
import { DataService, SensorData } from '../../services/data.service';

@Component({
  selector: 'app-humidity',
  templateUrl: './humidity.component.html',
  styleUrls: ['./humidity.component.css']
})
export class HumidityComponent implements OnInit {
  humidityData: { timestamp: string; humidity: number; needsWatering: number }[] = [];
  needsWatering: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getSensorData().subscribe((data: SensorData[]) => {
      this.humidityData = data.map(item => ({
        timestamp: item.Timestamp,
        humidity: item.Humidity,
        needsWatering: item.NeedsWatering
      }));
      this.needsWatering = this.humidityData.some(d => d.needsWatering === 1);
    });
  }
}
