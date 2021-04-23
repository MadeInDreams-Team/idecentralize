import React, { Component } from 'react'
import { connect } from 'react-redux'
import Chart from 'react-apexcharts'
import Spinner from './Spinner'
import { chartOptions} from './PriceChart.config'
import {
  priceChartLoadedSelector,
  priceChartSelector,
  tokenSymbolLoadedSelector
} from '../store/selectors'

const priceSymbol = (lastPriceChange) => {
  let output
  if(lastPriceChange === '+') {
    output = <span className="text-success">&#9650;</span> // Green up tiangle
  } else {
    output = <span className="text-danger">&#9660;</span> // Red down triangle
  }
  return(output)
}

class PriceChart extends Component {

  showPriceChart = (priceChart) => {
  
    
     return(
       <div className="price-chart ">
         <div className="price">
           <h4 className="pricecharth4">
             {this.props.symbol}/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}
             </h4>
             
         </div>
         <Chart className="chart" options={chartOptions} series={priceChart.series} type='candlestick' width={'100%'} height={'100%'} />
       </div>
     )
   }

  render() {
    return (
      <div className="card bg-transparent ">
        
        <div className="card-body " >
          
          {this.props.priceChartLoaded ? this.showPriceChart(this.props.priceChart) : <Spinner />}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  
  
  return {
    
    priceChartLoaded: priceChartLoadedSelector(state),
    priceChart: priceChartSelector(state),
    symbol: tokenSymbolLoadedSelector(state),
    
  }
}

export default connect(mapStateToProps)(PriceChart)