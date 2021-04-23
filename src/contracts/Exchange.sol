pragma solidity 0.6.2;

import "./Token.sol";
import "./NFT.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

// TODO:
// [x] SET THE FEE ACCOUNT
// [x] DEPOSIT ETH 
// [x] WITHDRAW ETH 
// [x] DEPOSIT TOKENS 
// [x] WITHDRAW TOKENS
// [x] CHECK BALANCES
// [x] MAKE ORDER
// [x] CANCEL ORDER
// [x] FILL ORDER
// [x] CHARGE FEES
// [x] ADD NFT       
// [x] ADD OTHER TOKENS

// [ ] ADD STACKING
// [ ] Add SWAP








////////////////////////////////////////////////////////////////////////////// EXCHANGE

contract Exchange {

/////////////////////////////// CONTRACT VARIABLE DECLARATION    
    using SafeMath for uint;
    
    address public admin;
    address public feeAccount;
    uint256 public feePercent;
    address constant ETHER = address(0); // Store Ether in tokens maping with default Ether address
    mapping(address => mapping(address => uint256)) public tokens; // addres on echange of token addresse <-----------------------------------------GOOD FOR ANY TOKENS?
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;
   
//////////////////////////////// My NFTs

NFT public nft;

///////////////////////////////// ERC INTERFACE

Token token = new Token();

/////////////////////////////// OTHER TOKENs
uint256 public tokenCount; /// keeps track of the amount of token added
mapping(uint256 => _OtherToken) public otherTokens; // maping of othertokens struct


struct _OtherToken{
    uint256 tokenId;
    address tokenAddress;
}
event OtherToken(
    uint256 tokenId,
    address tokenAddress
   
);
event CancelOtherToken(
    uint256 tokenId,
    address tokenAddress
 
);

//////////////////////////////EVENTS FOR EXCHANGE
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(
        uint id,
        address user, // adress of who made the order
        address tokenGet, // they want to purchase 
        uint amountGet,   // amon they want to get
        address tokenGive, // token they give
        uint amountGive,   // amount they give
        uint timestamp

    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp

    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp

    );
 

   struct _Order{
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
   }

    constructor (Token _tokenAddress, NFT _nftAddress, address _feeAccount, uint256 _feePercent ) public {
        
        admin = msg.sender;
        feeAccount = _feeAccount;
        feePercent = _feePercent;
        
        nft = _nftAddress;
        token = _tokenAddress;
    }
   /////////////////////////////////////////////////////////////////////////// NFT INTERFACE
   function getNFTBalance(address _owner) public view returns (uint256){
       return nft.balanceOf(_owner);
   }
   
   //////////////////////////////////////////////////////////////////////////// END OF NFT INTERFACE


//    modifier onlyOwner {
//     require(msg.sender == admin);
//     _;
// }



function isAdmin() public view  returns (bool){
    if(admin == msg.sender){
     return true;
    } else {
        return false;
    }
      
}



   /////////////////////////////////////////////////////////////////////////// REGITER TOKEN ON THE EXCHANGE
       function registerToken(address _tokenContract) public {
        require(msg.sender == admin);
        tokenCount = tokenCount.add(1);
        otherTokens[tokenCount] = _OtherToken(tokenCount, _tokenContract);
        emit OtherToken(tokenCount, _tokenContract );
        
    }

   //////////////////////////////////////////////////////////////////////////// END OF REGISTER TOKEN

   //////////////////////////////////////////////////////////////////////////// THE EXHANGE FUNCTIONS

    function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }
    
    function withdrawEther(uint256 _amount) public {
         require(tokens[ETHER][msg.sender] >= _amount);
         tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
         msg.sender.transfer(_amount);
         emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(getERCtransferFrom(_token ,msg.sender, address(this), _amount)); //////////////////// NEED UPDATE
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != address(0));
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(token.transfer(msg.sender, _amount));///////////////////////////////////////// NEED UPDATE
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
    //////////////////////BALANCE OF TOKENS ON THE EXCHANGE
    function balanceOf(address _token, address _user) public view returns (uint256) {
    return tokens[_token][_user];
    }
   // TODO ADD the exchane as an authorized minter

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public{
    // need to check balance on exchange
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
    }
    function cancelOrder(uint _id) public {
        _Order storage _order = orders[_id];
        require(address(_order.user) == msg.sender);
        require(_order.id == _id);
        orderCancelled[_id] = true;
        emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);
    }
    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount);
        require(!orderFilled[_id]);
        require(!orderCancelled[_id]);
        _Order storage _order = orders[_id];
        _trade(_order.id,  _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
        orderFilled[_order.id] = true;
    }  
     function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
        // Fee paid by the user that fills the order, a.k.a. msg.sender.
        uint256 _feeAmount = _amountGive.mul(feePercent).div(100); // fees deducted from the amount that order creator "user" will give
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive.sub(_feeAmount)); // msg.sender get ammount minus fees
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet); // user get his full amount
        tokens[_tokenGive][feeAccount] = tokens[_tokenGive][feeAccount].add(_feeAmount); /// fee account get payed
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive); // user get his acount deducted
         tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet); // msg.sender get deducted
        emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, now);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// ERC20 INERFACE

    
     function getERCname(address _token) public returns (string memory){
         token = Token(_token);
       return token.name();
   }
    function getERCsymbol(address _token) public returns (string memory){
         token = Token(_token);
       return token.symbol();
   }
   function getERCdecimals(address _token) public returns (uint256){
         token = Token(_token);
       return token.decimals();
   }
   function getERCtotalSupply(address _token) public returns (uint256){
         token = Token(_token);
       return token.totalSupply();
   }
    function getERCBalance(address _token, address _owner) public returns (uint256){
         token = Token(_token);
       return token.balanceOf(_owner);
   }
   function getERCtransfer(address _token, address _to, uint256 _value) public returns (bool){
         token = Token(_token);
       return token.transfer(_to, _value);
   }
   function getERCtransferFrom(address _token, address _from, address _to, uint256 _value) public returns (bool){
         token = Token(_token);
       return token.transferFrom(_from, _to, _value);
   }
   function getERCapprove(address _token, address _spender, uint256 _value) public returns (bool){
         token = Token(_token);
       return token.approve(_spender, _value);
   }
    function getERCallowance(address _token, address _owner, address _spender) public returns (uint256){
         token = Token(_token);
       return token.allowance(_owner, _spender);
   }

}                                                                                           
    

interface ERC{
    function name() external view returns (string memory);
    function symbol() external view returns (string memory _symbol);
    function decimals() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function balanceOf(address _owner) external view returns (uint256 balance);
    function transfer(address _to, uint256 _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
    function approve(address _spender, uint256 _value) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);

}
