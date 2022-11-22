
import { expect } from "chai";
import { ethers } from "hardhat";
import { DiscreteStakingRewards, DiscreteStakingRewards__factory, RewardToken, RewardToken__factory, StakingToken, StakingToken__factory } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const toEther = (n:number) => ethers.utils.parseUnits(n.toString(), 'ether')

describe("DiscreteStaking",  () => {
    let contract:DiscreteStakingRewards
    let rewardToken : RewardToken, stakingToken: StakingToken
    let accounts:any

    beforeEach(async() => {
      accounts = await ethers.getSigners()
      const DiscreteStakingRewards: DiscreteStakingRewards__factory =await  ethers.getContractFactory("DiscreteStakingRewards")
      const RewardToken : RewardToken__factory = await ethers.getContractFactory("RewardToken")
      const StakingToken : StakingToken__factory = await ethers.getContractFactory("StakingToken")

      rewardToken = await RewardToken.deploy("RewToken","RT")
      stakingToken = await StakingToken.deploy("StkToken","ST")
      contract = await DiscreteStakingRewards.deploy(stakingToken.address, rewardToken.address)
      await (await rewardToken.mint(contract.address, toEther(9000000) )).wait()
      await (await stakingToken.mint(accounts[1].address, toEther(9000000) )).wait()
      await (await stakingToken.mint(accounts[2].address, toEther(9000000) )).wait()
      await (await stakingToken.approve(contract.address, toEther(9000000) )).wait()
      await (await rewardToken.approve(contract.address, toEther(9000000) )).wait()
      await (await stakingToken.connect(accounts[1]).approve(contract.address, toEther(9000000) )).wait()
      await (await stakingToken.connect(accounts[2]).approve(contract.address, toEther(9000000) )).wait()
      
    })

    describe("Stake ", () => {
      beforeEach(async () => {
        await (await contract.stake(toEther(1000))).wait()
       
        await (await contract.connect(accounts[1]).stake(toEther(1000))).wait()

        await (await contract.connect(accounts[2]).stake(toEther(1000))).wait()
      })
     

      it("Should stake tokens correctly", async () => {
        expect(await contract.balanceOf(accounts[0].address)).to.equal(toEther(1000))
        expect(await contract.balanceOf(accounts[1].address)).to.equal(toEther(1000))
        expect(await contract.balanceOf(accounts[2].address)).to.equal(toEther(1000))
        expect(await contract.totalSupply()).to.equal(toEther(3000))
      })

      it("Reward need to be upadated", async () => {
        expect(await contract.calculateRewardsEarned(accounts[0].address)).to.equal(0)
      })

      it("Updates reward correctly" , async() => {
        await (await contract.updateRewardIndex(toEther(1000))).wait()
        expect(await contract.calculateRewardsEarned(accounts[0].address)).to.be.greaterThan(0)
        expect(await contract.calculateRewardsEarned(accounts[1].address)).to.be.greaterThan(0)
        expect(await contract.calculateRewardsEarned(accounts[2].address)).to.be.greaterThan(0)
      })
    })

    

    describe("Unstake & Claim" ,  () => {
      beforeEach(async () => {
        await (await contract.stake(toEther(1000))).wait()
        await (await contract.connect(accounts[1]).stake(toEther(1000))).wait()
        await (await contract.connect(accounts[2]).stake(toEther(1000))).wait()
        await (await contract.updateRewardIndex(toEther(1000))).wait()
      })
      
      it("Should claim rewards", async () => {
        const balanceBefore = await rewardToken.balanceOf(accounts[1].address)
        await (await contract.connect(accounts[1]).claim()).wait()
        const balanceAfter = await rewardToken.balanceOf(accounts[1].address)
        expect( balanceAfter).to.be.greaterThan(balanceBefore)
      })

      it("Should unstake" , async () => {
        await (await contract.connect(accounts[2]).unstake(toEther(900000))).wait()
        expect(await contract.balanceOf(accounts[2].address)).to.equal(0)
      })


    })
});
