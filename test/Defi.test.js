import { tokens, ether, EVM_REVERT, ETHER_ADDRESS, wait} from '../helpers'

const { iteratee } = require("lodash")
const { Web3 } = require("web3")
const { contracts_build_directory } = require("../truffle-config")

const Token = artifacts.require('./Token')
const IDTToken = artifacts.require('./IDTToken')
const Stacking = artifacts.require('./Stacking')


require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Stacking', ([deployer, user1]) => {
    let token
    let token2
    let stacking
   
    beforeEach(async () => {

        // Deploy token
        token = await IDTToken.new()
        token2 = await Token.new()
        // Deploy stacking
        token.mint(deployer,'1000000000000000000000')


        stacking = await Stacking.new(
            token.address,
            process.env.DEV_ADDRESS, // Your address where you get sushi tokens - should be a multisig
            web3.utils.toWei(process.env.TOKENS_PER_BLOCK), // Number of tokens rewarded per block, e.g., 100
            process.env.BONUS_END_BLOCK,
            process.env.START_BLOCK, // Block number when token mining starts
            ) 
            await token.transferOwnership(stacking.address)
    })

    describe('Adding Liquidity token to Pool', async () => {

        it('check the balance of the pool', async () => {
            let balance = await token.balanceOf(stacking.address)
            balance.toNumber().should.equal(0, 'Pool Balance is correct')

        })
        it('Add a token to liquidity pool', async () => {
            const stack = await stacking.add(1, token.address,false)
            const stack2 = await stacking.add(1, token2.address,false)
        })

    })



    describe('Stacking', async () => { 
    let result

    beforeEach(async () => {
        let  amount = tokens(100)
        let id = '0'

        await stacking.add(1, token.address,false)
        await stacking.add(1, token.address,false)
        await token.approve(stacking.address, amount, {from: deployer})
        result = await stacking.stackToken(amount, id)
         let pool = await stacking.poolInfo(id)
         console.log('LAST BLOCK REWARD BEFORE : ',pool.lastRewardBlock.toNumber())
     })

    it('tracks the newly created Stack on the pool', async () => {
         let id = '0';
         const pool = await stacking.poolInfo(id)
         pool.allocPoint.toNumber().should.be.equal(1, 'allocation is correct')
         pool.tokenStack.should.equal(token.address, 'token is correct')
         pool.accIDTPerShare.toNumber().should.equal(0, 'accIDTPerShare is correct')
    })
    it('check the balance of the pool', async () => {
        let balance = await token.balanceOf(stacking.address)
        balance.toString().should.equal(tokens(100), 'Pool Balance is correct') 
    })
    it('check the last reward block', async () => {
        let id = '0';
        let pool = await stacking.poolInfo(id)
        console.log('LAST BLOCK REWARD : ',pool.lastRewardBlock.toNumber())
        console.log('IDT PER SHARE ACCUMUILATED : ',pool.accIDTPerShare.toNumber())  
    })
    it('check the balance of the dev', async () => {
        let balance = await token.balanceOf(process.env.DEV_ADDRESS)
        balance.toString().should.equal(tokens(1900), 'dev Balance is correct')
    })
    it('Unstack token', async () => {
        let bal = await token.balanceOf(deployer)
        bal.toString().should.equal(tokens(1900), 'dev Balance before is correct')
        await wait(20)
         let id = '0';
         await stacking.unStackToken(tokens(100), id, {from:deployer})
        let pool = await stacking.poolInfo(id)
        console.log('LAST BLOCK REWARD : ',pool.lastRewardBlock.toNumber())
        console.log('IDT PER SHARE ACCUMUILATED : ',pool.accIDTPerShare.toNumber())
        let balance = await token.balanceOf(deployer)
        balance.toString().should.equal(tokens(2050), 'dev Balance is correct') 
        let balance2 = await token.balanceOf(stacking.address)
        balance2.toString().should.equal(tokens(500), 'pool Balance is correct')
    })
   
   
})



})