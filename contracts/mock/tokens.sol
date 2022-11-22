// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakingToken is ERC20{
    constructor(string memory name, string memory symbol) ERC20(name,symbol){
        mint(msg.sender, 9000000e18);
    }

    function mint(address recipient, uint amount) public {
        _mint(recipient, amount);
    }
}

contract RewardToken is ERC20{
    constructor(string memory name, string memory symbol) ERC20(name,symbol){
        mint(msg.sender, 9000000e18);
    }

    function mint(address recipient, uint amount) public {
        _mint(recipient, amount);
    }
}