import { Component, OnInit } from '@angular/core';
import { DataService, SensorData } from '../../services/data.service';

@Component({
  selector: 'app-light-level',
  templateUrl: './light-level.component.html',
  styleUrls: ['./light-level.component.css']
})
export class LightLevelComponent implements OnInit {
  lightLevelData: { timestamp: string; luminosity: number; needsWatering: number }[] = [];
  needsWatering: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getSensorData().subscribe((data: SensorData[]) => {
      this.lightLevelData = data.map(item => ({
        timestamp: item.Timestamp,
        luminosity: item.Luminosity,
        needsWatering: item.NeedsWatering
      }));
      this.needsWatering = this.lightLevelData.some(d => d.needsWatering === 1);
    });
  }
}
