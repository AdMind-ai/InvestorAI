import { Box, Typography } from "@mui/material";
import { useMarket } from "../../../context/MarketContext";
import CrosshairPlugin from 'chartjs-plugin-crosshair';
import { Chart } from "react-chartjs-2";
import { ChartData, ChartTypeRegistry, ChartOptions, TooltipItem } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale, 
  LinearScale,   
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  BarController, 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,    
  BarController, 
  CrosshairPlugin
);


const MarketChart = () => {
  const { historyData, historyInfo } = useMarket();

  const chartDataLabels = historyData.map(d => d.Date || "");
  
  const chartData: ChartData<keyof ChartTypeRegistry> = {
    labels: historyData.map(d => {
      if (!d.Date) return "";
      const dt = new Date(d.Date);
    
      // Date: dd/mm/yyyy
      const data = dt.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    
      // Hour: HH:mm
      const hora = dt.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 24h
      });
    
      return `${data} ${hora}`; // "28/04/2025 13:38"
    }),
    datasets: [
      {
        type: 'line',
        label: 'Prezzo del titolo (€)',
        data: historyData.map(d => d.Close),
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.3)', 
        fill: true, 
        tension: 0.2, 
        pointBackgroundColor: 'blue',
        pointRadius: historyData.length>20? 2:4,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#25d366',
        yAxisID: 'y',
        order: 2,
      },
      {
        // Volume barras
        type: 'bar',
        label: 'Volume',
        data: historyData.map(d => d.Volume),
        yAxisID: 'yVolume',
        backgroundColor: 'rgba(255,165,0,0.4)',
        borderRadius: 4,
        order: 1,
        barPercentage: 1, 
        categoryPercentage: 1,
      }, 
    ],
  };

  const chartOptions: ChartOptions<keyof ChartTypeRegistry> = {
    responsive: true, 
    maintainAspectRatio: false, 
    animation: {
      duration: 1500,
      easing: 'easeOutQuart', 
    },
    interaction: {
      mode: 'index',      
      intersect: false  
    },
    layout: {
      padding: {
        left: 10,   
        right: 10, 
        top: 25,    
        bottom: 5  
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#333', 
          padding: 10,
          font: {
            family: 'Roboto',
            size: 11,
            weight: 'bold',
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const idx = context.dataIndex;
            const d = historyData[idx];
            if (context.dataset.label === 'Volume') {
              return `Volume: ${d.Volume.toLocaleString()}`;
            }
            return [
              `Close: ${d.Close.toFixed(4)}`,
              `Open: ${d.Open.toFixed(4)}`,
              `High: ${d.High.toFixed(4)}`,
              `Low: ${d.Low.toFixed(4)}`,
            ];
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
      // @ts-expect-error crosshair is from external plugin and not in Chart.js types
      crosshair: {
        line: {
          color: '#fff',   
          width: 2,
          dashPattern: [4, 4], 
        },
        sync: { enabled: false },
        zoom: { enabled: false },
        snap: true,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
        offset: false,
      },
      xPrice: {
        grid: {
          display: true,
          color: '#eee', 
          drawTicks: true,        
          tickColor: 'red',
          tickLength: 8,
        },
        ticks: {
          maxTicksLimit: 5,
          callback: function(tickValue: string | number) {
            const dateStr = chartDataLabels[tickValue as number];
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
          },
          color: '#555',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: '#eee', 
        },
        ticks: {
          color: '#555',
          font: {
            size: 12,
          },
          callback: function(tickValue: string | number) {
            if (typeof tickValue === "number") {
              return tickValue.toFixed(2);
            }
            return tickValue;
          }

        },
        // title: { display: true, text: "Precio" },
      },
      yVolume: {
        position: 'right',
        grid: { display: false },
        // ticks: { display: false }, 
        ticks: {
          display: true,
          color: '#888',
          font: { size: 11 },
          callback: function(tickValue: string | number) {
            // Compact notation: k, M, B
            if (typeof tickValue === "number") {
              const absVal = Math.abs(tickValue);
              if (absVal >= 1_000_000_000) return (tickValue/1e9).toFixed(1).replace('.0','') + 'B';
              if (absVal >= 1_000_000) return (tickValue/1e6).toFixed(1).replace('.0','') + 'M';
              if (absVal >= 1_000) return (tickValue/1e3).toFixed(1).replace('.0','') + 'k';
              return tickValue;
            }
          }
        },
        title: { display: false },
        beginAtZero: true,
        max: Math.max(...historyData.map(d => d.Volume)) * 1, // *3 diminui a altura relativa das barras!
        // O multiplicador faz com que as barras fiquem proporcionais, mas não enormes.
      }
    },
  } as const;

  function formatTime(epochSeconds?: number) {
    if (!epochSeconds) return '';
    const dt = new Date(epochSeconds * 1000);
    return dt.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,    
    });
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection:'column', gap: 1 }}>
      <Typography sx={{ color: '#888', textAlign: 'start', fontSize: '0.6rem' }}>
        ultima aggiornamento: {historyInfo?.regularMarketTime ? formatTime(historyInfo.regularMarketTime) : ''}
      </Typography>
      <Box sx={{ height: 250, bgcolor: '#f7f7f7', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Chart type="line" data={chartData} options={chartOptions} />
      </Box>
    </Box>
  );
};

export default MarketChart;