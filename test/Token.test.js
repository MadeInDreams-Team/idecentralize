import { tokens, EVM_REVERT} from '../helpers'

const { iteratee } = require("lodash")
const { default: Web3 } = require("web3")
const { contracts_build_directory } = require("../truffle-config")

const Token = artifacts.require('./Token')
require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token', ([deployer, receiver, exchange]) => {
    const name = "Madeindreams Exchange Token"
    const symbol = "MET"
    const decimals = '18'
    const totalSupply = tokens(100000000)
    let token


    beforeEach(async () => {
        token = await Token.new() 
    })

    describe('deployment', () => {
        it('Tracking the name', async () => {
            
            const result = await token.name()
            result.should.equal(name)

        })
        it('tracks the symbol', async () => { 
            const result = await token.symbol()
            result.should.equal(symbol)

        })
        it('tracks the decimals', async () => {
            const result = await token.decimals()
            result.toString().should.equal(decimals)
            
        })
        it('tracks the totalSupply', async () => {
            const result = await token.totalSupply()
            result.toString().should.equal(totalSupply.toString())
            
        })
        it('transfer token balance', async () => {
           const result = await token.balanceOf(deployer)
           result.toString().should.equal(totalSupply.toString())
            
        })

    
    })

    describe('sending tokens', () => {
        let amount
        let result

        describe('success', async () => {
            beforeEach(async () => {
                amount = tokens(100)
                result = await token.transfer(receiver, amount, {from: deployer})
            })
        
            it('transfer token balance', async () => {
                let balanceOf
               
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(99999900).toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(amount.toString())
            })
    
            it('emit a Transfer event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Transfer')
                const event = log.args
                event.from.toString().should.equal(deployer, 'from is correct')
                event.to.should.equal(receiver, 'to is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
                
            })
           
        })

        describe('failure', async () => {
            it('reject insufficient balances', async () => {
                let invalidAmount
                invalidAmount = tokens(999999999)
                await token.transfer(receiver, invalidAmount, {from: deployer}).should.be.rejectedWith(EVM_REVERT);

                invalidAmount = tokens(10)
                await token.transfer(receiver, invalidAmount, {from: receiver}).should.be.rejectedWith(EVM_REVERT);
            })
            it('reject invalid recipients', async () => {
                await token.transfer(0x0, amount, {from: deployer}).should.be.rejected;

            })

        })

    })

    describe('approving tokens', () => {
        let result
        let amount

        beforeEach(async () => {
            amount = tokens(100)
            result = await token.approve(exchange, amount, { from: deployer})
        })

        describe('success', () => {
            it('allocates an allowance for delegated spending', async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal(amount.toString())
            })
            it('emit a Approval event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Approval')
                const event = log.args
                event.owner.toString().should.equal(deployer, 'owner is correct')
                event.spender.should.equal(exchange, 'spender is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
            })
        })

        describe('failure', () => {
            it('rejects invalid spenders', async () => {
                await token.approve(0x0, amount, {from: deployer}).should.be.rejected;
            })
        })

    })


    describe('delegated token transfer', () => {
        let amount
        let result

        beforeEach(async () => {
            amount = tokens(100)
            await token.approve(exchange, amount, {from: deployer})
        })

        describe('success', async () => {
            beforeEach(async () => {
                amount = tokens(100)
                result = await token.transferFrom(deployer, receiver, amount, {from: exchange})
            })
        
            it('transfer token balance', async () => {
                let balanceOf
               
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(99999900).toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(tokens(100).toString())
            })
    
            it('emit a Transfer event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Transfer')
                const event = log.args
                event.from.toString().should.equal(deployer, 'from is correct')
                event.to.should.equal(receiver, 'to is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
                
            })
            it('resets the allowance', async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal('0')
            })
           
        })

        describe('failure', async () => {
            it('reject insufficient amount', async () => {
                const invalidAmount = tokens(999999999)
                await token.transferFrom(deployer, receiver, invalidAmount, {from: exchange}).should.be.rejectedWith(EVM_REVERT);
            })
            it('reject invalid recipients', async () => {
                await token.transferFrom(deployer, 0x0, amount, {from: exchange}).should.be.rejected;

            })

        })

    })




})