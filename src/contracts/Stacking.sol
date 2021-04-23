pragma solidity 0.6.2;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Token.sol";
import "./IDTToken.sol";
//import "./NFT.sol";
//import "./Exchange.sol";

// TODO:
// [x] SET THE POOL ACCOUNT
// [x] DEPOSIT TOKEN
// [x] WITHDRAW TOKEN WITH INTEREST
// [x] GENERATE TOKEN ON EACH BLOCK
// [x] REWARD USER FOR STACKING
// [X] I WANT MORE

contract Stacking is Ownable{

    using SafeMath for uint256;
    //using SafeERC20 for IERC20;

  
    mapping(address => uint256) public poolBalance; //mapping of token address and amount

    address constant ETHER = address(0);
    mapping(uint256 => mapping(address => uint256)) public stackers;
  
 
  
    uint256 public stackCount;
    uint256 public startBlock;
    IDTToken public idt;
    Token stk = new Token(); //***/ */
    PoolInfo[] public poolInfo;
    uint256 public bonusEndBlock;
    uint256 public constant BONUS_MULTIPLIER = 10;
    uint256 public idtPerBlock;
    // Dev address.
    address public devAddress;

    uint256 public totalAllocPoint = 0;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);

 
    struct PoolInfo {
        address tokenStack;           // Address of LP token contract.
        uint256 allocPoint;       // How many allocation points assigned to this pool. SUSHIs to distribute per block.
        uint256 lastRewardBlock;  // Last block number that SUSHIs distribution occurs.
        uint256 accIDTPerShare; // Accumulated SUSHIs per share, times 1e12. See below.
    }

    constructor (IDTToken _token, address _devAddress, uint256 _idtPerBlock, uint _startBlock, uint256 _bonusEndBlock ) public {
        idt = _token;
        devAddress = _devAddress;
        idtPerBlock = _idtPerBlock;
        bonusEndBlock = _bonusEndBlock;
        startBlock = _startBlock;    
        }
function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }
        // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(uint256 _allocPoint, address _lpToken, bool _withUpdate) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(PoolInfo({
            tokenStack: _lpToken,
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accIDTPerShare: 0
        }));
    }

    function deposit(uint256 _amount, uint256 _id) public payable {
         //require token is approved
         PoolInfo storage pool = poolInfo[_id];
        updatePool(_id);
        stackers[_id][msg.sender] = stackers[_id][msg.sender].add(_amount); 
        require(getERCtransferFrom(pool.tokenStack, msg.sender, address(this), _amount));
         
        emit Deposit(msg.sender, _id, _amount);
    }

    function withdraw(uint256 _amount, uint256 _id) public payable {
        PoolInfo storage pool = poolInfo[_id];
       require(stackers[_id][msg.sender] >= _amount); 
       updatePool(_id);
        uint256 pending = stackers[_id][msg.sender].mul(pool.accIDTPerShare).div(1e12);
        if(pending > 0) {
            safeIDTTransfer(msg.sender, pending);
        }
        if(_amount > 0) {
            stackers[_id][msg.sender] = stackers[_id][msg.sender].sub(_amount);
            
            getERCtransfer(pool.tokenStack,address(msg.sender), _amount);
        }
        emit Withdraw(msg.sender, _id, _amount);

    }

// Safe IDT transfer function, just in case if rounding error causes pool to not have enough IDTs.
    function safeIDTTransfer(address _to, uint256 _amount) internal {
        uint256 idtBal = idt.balanceOf(address(this));
        if (_amount > idtBal) {
            idt.transfer(_to, idtBal);
        } else {
            idt.transfer(_to, _amount);
        }
    }

// mint some tokens

function updatePool(uint256 _pid) public {
      PoolInfo storage pool = poolInfo[_pid];
         if (block.number <= pool.lastRewardBlock) {
             return;
         }
        uint256 supply = getERCBalance(pool.tokenStack,address(this));
        if (supply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
  uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
  uint256 idtReward = multiplier.mul(idtPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
        idt.mint(devAddress, idtReward.div(10));
        idt.mint(address(this), idtReward);
        pool.accIDTPerShare = pool.accIDTPerShare.add(idtReward.mul(1e12).div(supply));
        pool.lastRewardBlock = block.number;
}

  // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

// Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
        if (_to <= bonusEndBlock) {
            return _to.sub(_from).mul(BONUS_MULTIPLIER);
        } else if (_from >= bonusEndBlock) {
            return _to.sub(_from);
        } else {
            return bonusEndBlock.sub(_from).mul(BONUS_MULTIPLIER).add(
                _to.sub(bonusEndBlock)
            );
        }
    }
    

 // return the balance of stacker
 function stackingBalanceOf(uint256 _id, address _user) public view returns (uint256) {
    return stackers[_id][_user];
    }
// return the balance of the pool for this token

function balanceOfPool(address _token) public view returns (uint256) {
    return poolBalance[_token];
    }

   // View function to see pending SUSHIs on frontend.
    function pendingIDT(uint256 _pid) public returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        uint256 accIDTPerShare = pool.accIDTPerShare;
        uint256 lpSupply = getERCBalance(pool.tokenStack, address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 idtReward = multiplier.mul(idtPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
            accIDTPerShare = accIDTPerShare.add(idtReward.mul(1e12).div(lpSupply));
        }
        return stackers[_pid][msg.sender].mul(accIDTPerShare).div(1e12);
    }

// EXTERNaL CALL TO ERC20 Contract
function getERCapprove(address _token, address _spender, uint256 _value) public returns (bool){
         stk = Token(_token);
       return stk.approve(_spender, _value);
   }
    function getERCtransferFrom(address _token, address _from, address _to, uint256 _value) public returns (bool){
         stk = Token(_token);
       return stk.transferFrom(_from, _to, _value);
   }
    function getERCBalance(address _token, address _owner) public returns (uint256){
         stk = Token(_token);
       return stk.balanceOf(_owner);
   }
   function getERCtransfer(address _token, address _to, uint256 _value) public returns (bool){
         stk = Token(_token);
       return stk.transfer(_to, _value);

}
  function getERCname(address _token) public returns (string memory){
         stk = Token(_token);
       return stk.name();

}
  function getERCsymbol(address _token) public returns (string memory){
         stk = Token(_token);
       return stk.symbol();

}


}