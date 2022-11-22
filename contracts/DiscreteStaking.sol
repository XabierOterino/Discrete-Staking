// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DiscreteStakingRewards{

    IERC20 public  stakingToken;
    IERC20 public  rewardToken;

    mapping(address => uint) public balanceOf; // currently staked
    uint public totalSupply;

    uint private constant MULTIPLIER = 1e18;
    uint private rewardIndex;
    mapping(address => uint) rewardIndexOf;
    mapping(address => uint) private earned;


    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    function updateRewardIndex(uint reward) external {
        rewardToken.transferFrom(msg.sender, address(this), reward);
        rewardIndex += (reward * MULTIPLIER) / totalSupply;
    }


    function _calculateRewards(address account) private view returns(uint) {
        uint shares = balanceOf[account];
        return (shares * (rewardIndex - rewardIndexOf[account])) / MULTIPLIER;   
    }

    function calculateRewardsEarned(address account) external view returns(uint){
        return earned[account] + _calculateRewards(account);
    }

    function _updateRewards(address account) private {
        earned[account] += _calculateRewards(account);
        rewardIndexOf[msg.sender] = rewardIndex;
    }

    function stake(uint amount) external {
        _updateRewards(msg.sender);
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        stakingToken.transferFrom(msg.sender, address(this), amount);
    }


    function unstake(uint amount) external {
        _updateRewards(msg.sender);
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        stakingToken.transfer(msg.sender, amount);
    }

    function claim() external returns(uint){
        _updateRewards(msg.sender);

        uint reward = earned[msg.sender];

        if(reward > 0 ){
            earned[msg.sender] = 0;
            rewardToken.transfer(msg.sender, reward);
        }

        return reward;
    }




}