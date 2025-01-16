import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css']
})
export class GaugeComponent implements OnChanges {
  @Input() value: number = 0;
  @Input() color: string = '#4CAF50';  // Default green color
  @Input() label: string = '';
  @Input() unit: string = '%';

  radius: number = 85;
  circumference: number = 2 * Math.PI * this.radius;
  dashoffset: number = 0;
  
  ngOnChanges(): void {
    // Calculate the dash offset based on the value
    const progress = (100 - this.value) / 100;
    this.dashoffset = progress * this.circumference;
  }
}