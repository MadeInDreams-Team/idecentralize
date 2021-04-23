// contracts/IDTToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IDTToken is ERC20, Ownable {




    constructor() public ERC20("IDecentralize Token", "IDT") {
        uint256 initialSupply = 1000000000000000000000;
        _mint(msg.sender, initialSupply);
    }


    function mint(address _to,uint256 _amount) public onlyOwner {
        _mint(_to, _amount);

    }



}