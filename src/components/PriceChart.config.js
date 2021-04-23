export const chartOptions = {
  plotOptions: {
    candlestick: {
      colors: {
        upward: '#15f45f',
        downward: '#ba277f'
      },
      wick: {
        useFillColor: true,
      }
    }
  },
  chart: {
    animations: { enabled: false },
    foreColor: "#000",
    toolbar: { 
      show: true, 
      theme:'dark',
      colors:'#000',
    },
    width: '100px'
  },
  tooltip: {
    enabled: true,
    theme: false,
    colors:'#000',
    
    style: {
      fontSize: '12px',
      fontFamily: undefined
    },
    x: {
        show: true,
        format: 'dd MMM',
        formatter: undefined,
    },
    y: {
      show: true,
      title: 'price',
    },
    marker: {
      show: false,
    },
    items: {
       display: 'flex',
    },
    fixed: {
        enabled: false,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0,
    },
  },
  xaxis: {
    type: 'datetime',
    labels: {
      show: true,
      style: {
          colors: '#fff',
          fontSize: '8px',
          cssClass: 'apexcharts-xaxis-label',
      },
    },
  },
  yaxis: {
    labels: {
      show: true,
      minWidth: 0,
      maxWidth: 160,
      style: {
        colors: '#ffffff',
        fontSize: '10px',
        cssClass: 'apexcharts-yaxis-label',
      },
      offsetX: 0,
      offsetY: 0,
      rotate: 0,
    }
  }

}