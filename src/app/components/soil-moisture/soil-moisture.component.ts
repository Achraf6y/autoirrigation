import { Component, OnInit } from '@angular/core';
import { DataService, SensorData } from '../../services/data.service';

@Component({
  selector: 'app-soil-moisture',
  templateUrl: './soil-moisture.component.html',
  styleUrls: ['./soil-moisture.component.css']
})
export class SoilMoistureComponent implements OnInit {
  soilMoistureData: { timestamp: string; soilMoisture: number; needsWatering: number }[] = [];
  needsWatering: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getSensorData().subscribe((data: SensorData[]) => {
      this.soilMoistureData = data.map(item => ({
        timestamp: item.Timestamp,
        soilMoisture: item['Soil Moisture'],
        needsWatering: item.NeedsWatering
      }));
      this.needsWatering = this.soilMoistureData.some(d => d.needsWatering === 1);
    });
  }
}
