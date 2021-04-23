  
import web3 from 'web3'
export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
export const DECIMALS = (10**18)
export const GREEN = 'success'
export const RED = 'danger'

//shortcut to avoid passing arround web3 connection
export const ether = (wei) => {
    if(wei){
       // console.log('Amount passed : ',(wei))
      //  console.log('Conveted : ',web3.utils.toWei(wei.toString(),'ether'))

        return(web3.utils.toWei(wei.toString(),'ether')) // 18 decimal places
       
    }
}

// tokens and ether have same decimals resolution
export const tokens = (n) => ether(n)


export const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}