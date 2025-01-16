import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service'; // Ensure the service is correctly referenced

@Component({
  selector: 'app-humidity',
  templateUrl: './humidity.component.html',
  styleUrls: ['./humidity.component.css'],
})
export class HumidityComponent implements OnInit {
  latestHumidity: number = 0; // Latest humidity value
  timestamps: string[] = []; // Array of timestamps
  humidityValues: number[] = []; // Array of humidity values
  needsWatering: boolean = false; // Watering status

  // Line chart data and options
  lineChartData = {
    labels: [] as string[],
    datasets: [
      {
        label: 'Humidity Levels',
        data: [] as number[],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.3)',
        fill: true,
      },
    ],
  };

  lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        title: { display: true, text: 'Time' },
      },
      y: {
        title: { display: true, text: 'Humidity (%)' },
        min: 0,
        max: 100, // Assuming humidity ranges from 0 to 100
      },
    },
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getSensorData().subscribe((data: any[]) => {
      if (data && data.length > 0) {
        this.humidityValues = data.map((item) => item.Humidity || 0);
        this.timestamps = data.map((item) => item.Timestamp || '');
        this.latestHumidity = this.humidityValues[this.humidityValues.length - 1];
  
        // Check if any of the records indicate the plant needs watering
        const lastNeedsWatering = data[data.length - 1]?.NeedsWatering;
        this.needsWatering = lastNeedsWatering === 1;
  
        // Update line chart data
        this.lineChartData.labels = [...this.timestamps];
        this.lineChartData.datasets[0].data = [...this.humidityValues];
      }
    });
  }
  
}
