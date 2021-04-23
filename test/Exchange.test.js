import { tokens, ether, EVM_REVERT, ETHER_ADDRESS} from '../helpers'

const { iteratee } = require("lodash")
const { Web3 } = require("web3")
const { contracts_build_directory } = require("../truffle-config")



const Token = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')


require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
    let token
    let exchange
    const feePercent = 10
    
   

    beforeEach(async () => {

        // Deploy token
        token = await Token.new()

        // Transfer some token to user1
        token.transfer(user1, tokens(100), {from:deployer})

       
        // Deploy exchange
        exchange = await Exchange.new(token.address, feeAccount, feePercent) 
        
    })

    describe('deployment', () => {

        it('Tracking the fee account', async () => {
            const result = await exchange.feeAccount()
            result.should.equal(feeAccount)
        })
        it('Tracking the fee percent', async () => {
            const result = await exchange.feePercent()
            result.toString().should.equal(feePercent.toString())
        })
    })

    describe('fallback', () =>{
        it('revert when ETHER is sent', async () => {
            await exchange.sendTransaction({ value: 1, from: user1}).should.be.rejectedWith(EVM_REVERT)
        })
    })

    describe('deposit ETHER', () => {
        let result
        let amount
       
        beforeEach(async () => {
            amount = ether(1)
            result = await exchange.depositEther({ from: user1, value: amount})
           
            
        })
        it('track ether deposit', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1)
            balance.toString().should.equal(amount.toString())

        })
        it('emit a ETHER Deposit event', async () => {
            const log = result.logs[0]
            log.event.should.equal('Deposit')
            const event = log.args
            event.token.should.equal(ETHER_ADDRESS, 'ether address is correct')
            event.user.should.equal(user1, 'user address is correct')
            event.amount.toString().should.equal(amount.toString(), 'amount is correct')
            event.balance.toString().should.equal(amount.toString(), 'balance is correct')
        })


    })

    describe('withdrawing ETHER', async () => {
        let result
        let amount
       
        beforeEach(async () => {
            // Deposit first to test withdraw
            amount = ether(1)
            await exchange.depositEther({from: user1, value: amount})
          
            
        })

        describe('success', async () => {
            beforeEach(async () => {
                //Withdraw ETHER
               
                result = await exchange.withdrawEther(amount, {from: user1})
            })
            it('withdraws ETHER funds', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal('0')
            })
            it('emit a ETHER Withdraw event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Withdraw')
                const event = log.args
                event.token.should.equal(ETHER_ADDRESS, 'ether address is correct')
                event.user.should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal('0', 'balance is correct')
               
            })
        })
        describe('failure', async () => {
            it('rejects withdraws for insufficient balances', async() => {
               
                await exchange.withdrawEther(ether(100), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe('Token deposit', () => {
        let result
        let amount

        describe('success', () => {

            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1})
                result = await exchange.depositToken(token.address, amount, {from: user1})
            })
            
            it('track the token deposit', async () => {
               let balance
               balance = await token.balanceOf(exchange.address)
               balance.toString().should.equal(amount.toString())
               // check tokens on exchange
               balance = await exchange.tokens(token.address, user1)
               balance.toString().should.equal(amount.toString())
            })
            it('emit a Deposit event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Deposit')
                const event = log.args
                event.token.should.equal(token.address, 'token address is correct')
                event.user.should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal(amount.toString(), 'balance is correct')
            })
        })
        describe('failure', () => {
            it('rejects Ether deposits' , async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
            it('fails when no tokens ar approved', async () => {
                //dont approve any tokens before depositing
                await exchange.depositToken(token.address, tokens(10), { from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
      
        })

    })

    describe('withdrawing tokens', async () => {
        let result
        let amount

        describe('sucess', async () => {
            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, {from: user1})
                await exchange.depositToken(token.address, amount, {from:user1})

                result = await exchange.withdrawToken(token.address, amount, {from: user1})
            })
            it('witdraws token funds', async () => {
                const balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal('0')
            })
            it('emit a token Withdraw event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Withdraw')
                const event = log.args
                event.token.should.equal(token.address, 'ether address is correct')
                event.user.should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal('0', 'balance is correct')
                
            })

        })
        describe('failure', async () => {
            it('rejects ETHER withdraws', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
            it('fails for insufficient balances', async () => {
                await exchange.withdrawToken(token.address, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
            
        })
    })
  
    describe('checking balance', async () => {
        beforeEach(async () => {
            exchange.depositEther({from: user1, value: ether(1)})
        
        })
        it('returns user ETHER balance', async () => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
            result.toString().should.equal(ether(1).toString())
            
        })
    })

    describe('making orders', async () => {
        let result

        beforeEach(async () => {
            result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1})
            
        })
        it('tracks the newly created order', async () => {
            const orderCount = await exchange.orderCount()
            orderCount.toString().should.equal('1')
            const order = await exchange.orders('1')
            order.id.toString().should.equal('1', 'id is correct')
            order.user.should.equal(user1, 'use is correct')
            order.tokenGet.should.equal(token.address, 'tokenGet is correct')
            order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
            order.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
            order.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
            order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })
        it('emit an "Order" event', async () => {
            const log = result.logs[0]
            log.event.should.equal('Order')
            const event = log.args
            event.id.toString().should.equal('1', 'id is correct')
            event.user.should.equal(user1, 'use is correct')
            event.tokenGet.should.equal(token.address, 'tokenGet is correct')
            event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
            event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
            event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
            event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })

    })

    describe('order actions', async () => {

        beforeEach(async () => {
        // user1 deposit ether only
        await exchange.depositEther({ from: user1, value: ether(1)})
        //give tokens to user2
        await token.transfer(user2, tokens(100), { from: deployer })
        //user2 deposits tokens only
        await token.approve(exchange.address, tokens(2), { from: user2})
        await exchange.depositToken(token.address, tokens(2), {from: user2})
        // user1 makes an order to buy token with ether
        await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1})
        })

        describe('filling orders', async () => {
            let result

            describe('success', async () => {
                beforeEach(async () => {
                    //user2 fill order
                    result = await exchange.fillOrder('1', { from: user2 })
                })
                it('executes the trade & charges fees', async () => {
                    let balance
                    balance = await exchange.balanceOf(token.address, user1)
                    balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens')

                    balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
                    balance.toString().should.equal(ether('0.9').toString(), 'user2 received Ether')

                    balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
                    balance.toString().should.equal('0', 'user2 Ether deducted')

                    balance = await exchange.balanceOf(token.address, user2)
                    balance.toString().should.equal(tokens('1').toString(), 'user2 tokens deducted with fee applied')

                    const feeAccount = await exchange.feeAccount()
                    console.log('FEE ACCOUNT', feeAccount)
                    balance = await exchange.balanceOf(ETHER_ADDRESS, feeAccount)
                    balance.toString().should.equal(tokens('0.1').toString(), 'feeAcount received fee')
                })
                it('updates filled orders', async () => {
                    const orderFilled = await exchange.orderFilled(1)
                    orderFilled.should.equal(true)
                })
                it('emit a "Trade" event', async () => {
                    const log = result.logs[0]
                    log.event.should.equal('Trade')
                    const event = log.args
                    event.id.toString().should.equal('1', 'id is correct')
                    event.user.should.equal(user1, 'use is correct')
                    event.tokenGet.should.equal(token.address, 'tokenGet is correct')
                    event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
                    event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
                    event.userFill.should.equal(user2, 'userFill is corect')
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')

                })
            })
            describe('failure', async () => {
                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 9999
                    await exchange.cancelOrder(invalidOrderId, { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })
                it('rejects  already-filled orders', async () => {
                    //fill order
                    await exchange.fillOrder('1', { from: user2 }).should.be.fulfilled
                    // try to fill again
                    await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })
                it('rejects  cancelled orders', async () => {
                    //cancel order
                    await exchange.cancelOrder('1', { from: user1 }).should.be.fulfilled
                    // try to fill cancelled order
                    await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })

            })
        })
        describe('cancelling orders', async () => {
            let result

            describe('success', async () => {
                beforeEach(async () => {
                    result = await exchange.cancelOrder('1', { from: user1 })
                })
                it('updates cancelled orders', async () => {
                    const orderCancelled = await exchange.orderCancelled(1)
                    orderCancelled.should.equal(true)
                })
                it('emit a "Cancel" event', async () => {
                    const log = result.logs[0]
                    log.event.should.equal('Cancel')
                    const event = log.args
                    event.id.toString().should.equal('1', 'id is correct')
                    event.user.should.equal(user1, 'use is correct')
                    event.tokenGet.should.equal(token.address, 'tokenGet is correct')
                    event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
                    event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
                })
            })
            describe('failure', async () => {
                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 9999
                    await exchange.cancelOrder(invalidOrderId, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
                })
                it('rejects unauthorized cancelations', async () => {
                    await exchange.cancelOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })

            })

        })

    })

    // describe('Registering Token', async () => {
    //     let result
    //     beforeEach(async () => {
    //         result = await exchange.registerToken(token.address)
    //         console.log('REGISTERING : ',token.address)
    //     })
    //     it('tracks the newly registered Token', async () => {
    //         const tokenCount = await exchange.tokenCount()
    //         tokenCount.toString().should.equal('1')

    //         const otherTokens = await exchange.otherTokens('1')
    //         otherTokens.tokenId.toString().should.equal('1', 'id is correct')
    //         otherTokens.tokenAddress.toString().should.equal(token.address, 'address is correct')

    //     })
    //     it('Check the registered token name', async () => {
    //         const otherTokens = await exchange.otherTokens('1')
    //         console.log('OTHER TOKEN ; ',otherTokens)
    //         const name = "Madeindreams Exchange Token"
    //         //const symbol = "MET"
    //         //const decimals = '18'
    //         //const totalSupply = tokens(100000000)
    //         let otherTokenAddress = await otherTokens.tokenAddress
    //         console.log('TOKEN ADDRESS ; ',otherTokenAddress)

    //         result = await exchange.getERCname(otherTokenAddress)

    //         console.log('GET ERC NAME  ; ',result)
    //         result.toString().should.equal(name, 'Registered token name is correct')

    //     })
    // })

})