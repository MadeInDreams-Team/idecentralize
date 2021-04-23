
require('dotenv').config()
const { default: Web3 } = require("web3");

const Token = artifacts.require("Token");
const Token2 = artifacts.require("Token2");
const Exchange = artifacts.require("Exchange");
const NFT = artifacts.require("NFT");
const Stacking = artifacts.require("Stacking")
const IDTToken = artifacts.require("IDTToken")



module.exports = async function(deployer) {
  // deploying the ERC20 Token
  const accounts = await web3.eth.getAccounts();

  await deployer.deploy(Token);
 const idttoken = await deployer.deploy(IDTToken);

 await deployer.deploy(
    Stacking, 
    idttoken.address,
    process.env.DEV_ADDRESS, // Your address where you get sushi tokens - should be a multisig
    web3.utils.toWei(process.env.TOKENS_PER_BLOCK), // Number of tokens rewarded per block, e.g., 100
    process.env.START_BLOCK, // Block number when token mining starts
    process.env.BONUS_END_BLOCK // Block when bonus ends
    
    );
    const stacking = await Stacking.deployed()
   // await stacking.add(1, 0x6dc7242a3c515a578367f3307730719a5397de9f, false)
    await stacking.add(1, Token.address, false)
  // deploying the NFT
  const NFT_NAME = "ID Exclusivity Token";
  const NFT_SYMBOL = "IDET";
  const NFT_API = "https://madeindreams.ca/nft/api/token/"

  await deployer.deploy(NFT, NFT_NAME, NFT_SYMBOL, NFT_API)

  .then( async () => {
    //need the account 0 on all network where we deploy
    const feeAccount = accounts[0];
    const feePercent = 10;
   let  exchange = await deployer.deploy(Exchange,Token.address, NFT.address, feeAccount, feePercent);

     await exchange.registerToken(Token.address).then( async () => {
      
      await exchange.registerToken(idttoken.address);
     });
    
  })
  await idttoken.transferOwnership(Stacking.address)

  

};
