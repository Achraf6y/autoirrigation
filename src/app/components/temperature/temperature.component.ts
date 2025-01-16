import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import 'chartjs-plugin-zoom';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.css'],
})
export class TemperatureComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  latestTemperature: number = 0;
  needsWatering: boolean = false;
  temperatureValues: number[] = [];
  timestamps: Date[] = [];

  lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [] as number[],
        label: 'Temperature Levels',
        backgroundColor: 'rgba(255, 99, 132, 0.3)',
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: true,
        tension: 0.4
      }
    ],
    labels: [] as string[]
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x' as const,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'x' as const,
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm'
          }
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Temperature (°C)'
        },
        min: 0,
        max: 50
      }
    }
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getSensorData().subscribe((data: any[]) => {
      if (data && data.length > 0) {
        // Sort data by timestamp
        data.sort((a, b) => 
          this.parseTimestamp(a.Timestamp).getTime() - 
          this.parseTimestamp(b.Timestamp).getTime()
        );
        
        // Update data arrays
        this.temperatureValues = data.map(item => item.Temperature || 0);
        this.timestamps = data.map(item => this.parseTimestamp(item.Timestamp));
        
        // Update latest values
        this.latestTemperature = this.temperatureValues[this.temperatureValues.length - 1];
        this.needsWatering = data[data.length - 1]?.NeedsWatering === 1;

        // Update chart data
        this.lineChartData = {
          datasets: [{
            data: this.temperatureValues,
            label: 'Temperature Levels',
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: true,
            tension: 0.4
          }],
          labels: this.timestamps.map(date => date.toISOString())
        };
      }
    });
  }

  resetZoom() {
    if (this.chart?.chart) {
      this.chart.chart.resetZoom();
    }
  }

  private parseTimestamp(timestamp: string): Date {
    const [time, date] = timestamp.split('-');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const [day, month, year] = date.split('/').map(Number);

    return new Date(year + 2000, month - 1, day, hours, minutes, seconds);
  }
}