pragma solidity 0.5.12;
pragma experimental ABIEncoderV2;

import { IActions } from "../interfaces/IActions.sol";
import { DaiFiCollateral } from "./DaiFiCollateral.sol";
import { DaiFiInterest } from "./DaiFiInterest.sol";
import { ReentrancyGuard } from "../lib/ReentrancyGuard.sol";
import { SafeMath } from "../lib/SafeMath.sol";
import { Token } from "../lib/Token.sol";
import { Types } from "../lib/Types.sol";

/**
* @title DaiFiActions Contract
* @notice Abstract contract for supported DaiFi actions
* @author DaiFi
*/
contract DaiFiActions is IActions, DaiFiCollateral, DaiFiInterest, ReentrancyGuard {
    using SafeMath for uint256;

    /**
    * @notice The Dai contract address (private)
    */
    address private daiAddress;

    /**
    * @notice The total Wei balances (internal)
    */
    Types.Balances internal totalWei;

    /**
    * @notice The total attoDai balances (internal)
    */
    Types.Balances internal totalAttoDai;

    /**
    * @notice A mapping of the accounts (internal)
    */
    mapping(address=>Types.Account) internal accounts;

    /**
     * @notice constructor sets the Dai contract address from the given address (internal)
     * @param daiAddress_ The address of the Dai token
     * @param daiPriceOracle The address of the Dai price oracle
     */
    constructor(address daiAddress_, address daiPriceOracle) DaiFiCollateral(daiPriceOracle) internal {
        daiAddress = daiAddress_;
    }

    /**
    * @notice Supply Wei from sender account (external payable nonReentrant)
    */
    function supplyWei() external payable nonReentrant {
        require(msg.value != 0, "supplied zero Wei");
        require(accounts[msg.sender].wei_.borrowed == 0, "supplied Wei when already borrowing");

        applySuppliedWeiInterest(msg.sender);
        accounts[msg.sender].wei_.supplied = accounts[msg.sender].wei_.supplied.add(msg.value);

        totalWei.supplied = totalWei.supplied.add(msg.value);

        emit WeiSupplied(msg.sender, msg.value);
    }

    /**
    * @notice Withdraw Wei to sender account (external nonReentrant)
    * @param amount The amount of Wei to withdraw
    */
    function withdrawWei(uint256 amount) external nonReentrant {
        require(amount != 0, "withdrew zero Wei");

        applySuppliedWeiInterest(msg.sender);
        require(amount <= accounts[msg.sender].wei_.supplied, "withdrew more Wei than supplied");
        accounts[msg.sender].wei_.supplied = accounts[msg.sender].wei_.supplied.sub(amount);

        applyBorrowedAttoDaiInterest(msg.sender);
        require(isCollateralisedForAttoDai(accounts[msg.sender]), "not enough collateral");

        totalWei.supplied = totalWei.supplied.sub(amount);

        msg.sender.transfer(amount);

        emit WeiWithdrawn(msg.sender, amount);
    }

    /**
    * @notice Borrow Wei to sender account (external nonReentrant)
    * @param amount The amount of Wei to borrow
    */
    function borrowWei(uint256 amount) external nonReentrant {
        require(amount != 0, "borrowed zero Wei");
        require(accounts[msg.sender].wei_.supplied == 0, "borrowed Wei when already supplying");

        applyBorrowedWeiInterest(msg.sender);
        accounts[msg.sender].wei_.borrowed = accounts[msg.sender].wei_.borrowed.add(amount);

        applySuppliedAttoDaiInterest(msg.sender);
        require(isCollateralisedForWei(accounts[msg.sender]), "not enough collateral");

        totalWei.borrowed = totalWei.borrowed.add(amount);

        msg.sender.transfer(amount);

        emit WeiBorrowed(msg.sender, amount);
    }

    /**
    * @notice Repay Wei from sender account (external payable nonReentrant)
    */
    function repayWei() external payable nonReentrant {
        require(msg.value != 0, "repaid zero Wei");

        applyBorrowedWeiInterest(msg.sender);
        require(msg.value <= accounts[msg.sender].wei_.borrowed, "repaid more Wei than borrowed");
        accounts[msg.sender].wei_.borrowed = accounts[msg.sender].wei_.borrowed.sub(msg.value);

        totalWei.borrowed = totalWei.borrowed.sub(msg.value);

        emit WeiRepaid(msg.sender, msg.value);
    }

    /**
    * @notice Apply the interest accumulated (since last applied) to the supplied Wei balance of the given account (public)
    * param accountAddress The address of the account to apply interest to
    */
    function applySuppliedWeiInterest(address accountAddress) public {
        require(accountAddress != address(0), "applied interest to address 0x0");

        // TODO: implement and test. Update lastApplied block number
        uint256 interest = calculateSuppliedWeiInterest(accounts[accountAddress]);
        accounts[accountAddress].wei_.supplied = accounts[accountAddress].wei_.supplied.add(interest);
        totalWei.supplied = totalWei.supplied.add(interest);
        emit SuppliedWeiInterestApplied(accountAddress);
    }

    /**
    * @notice Apply the interest accumulated (since last applied) to the borrowed Wei balance of the given account (public)
    * param accountAddress The address of the account to apply interest to
    */
    function applyBorrowedWeiInterest(address accountAddress) public {
        require(accountAddress != address(0), "applied interest to address 0x0");

        // TODO: implement and test. Update lastApplied block number
        uint256 interest = calculateBorrowedWeiInterest(accounts[accountAddress]);
        accounts[accountAddress].wei_.borrowed = accounts[accountAddress].wei_.borrowed.add(interest);
        totalWei.borrowed = totalWei.borrowed.add(interest);
        emit BorrowedWeiInterestApplied(accountAddress);
    }

    /**
    * @notice Supply attoDai from sender account (external nonReentrant)
    * @param amount The amount of attoDai to supply
    */
    function supplyAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "supplied zero attoDai");
        require(accounts[msg.sender].attoDai.borrowed == 0, "supplied attoDai when already borrowing");

        applySuppliedAttoDaiInterest(msg.sender);
        accounts[msg.sender].attoDai.supplied = accounts[msg.sender].attoDai.supplied.add(amount);

        totalAttoDai.supplied = totalAttoDai.supplied.add(amount);

        require(Token.transferFrom(daiAddress, msg.sender, amount), "dai transfer failed");

        emit AttoDaiSupplied(msg.sender, amount);
    }

    /**
    * @notice Withdraw attoDai to sender account (external nonReentrant)
    * @param amount The amount of attoDai to withdraw
    */
    function withdrawAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "withdrew zero attoDai");

        applySuppliedAttoDaiInterest(msg.sender);
        require(amount <= accounts[msg.sender].attoDai.supplied, "withdrew more attoDai than supplied");
        accounts[msg.sender].attoDai.supplied = accounts[msg.sender].attoDai.supplied.sub(amount);

        applyBorrowedWeiInterest(msg.sender);
        require(isCollateralisedForWei(accounts[msg.sender]), "not enough collateral");

        totalAttoDai.supplied = totalAttoDai.supplied.sub(amount);

        require(Token.transferTo(daiAddress, msg.sender, amount), "dai transfer failed");

        emit AttoDaiWithdrawn(msg.sender, amount);
    }

    /**
    * @notice Borrow attoDai to sender account (external nonReentrant)
    * @param amount The amount of attoDai to borrow
    */
    function borrowAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "borrowed zero attoDai");
        require(accounts[msg.sender].attoDai.supplied == 0, "borrowed attoDai when already supplying");

        applyBorrowedAttoDaiInterest(msg.sender);
        accounts[msg.sender].attoDai.borrowed = accounts[msg.sender].attoDai.borrowed.add(amount);

        applySuppliedWeiInterest(msg.sender);
        require(isCollateralisedForAttoDai(accounts[msg.sender]), "not enough collateral");

        totalAttoDai.borrowed = totalAttoDai.borrowed.add(amount);

        require(Token.transferTo(daiAddress, msg.sender, amount), "dai transfer failed");

        emit AttoDaiBorrowed(msg.sender, amount);
    }

    /**
    * @notice Repay attoDai from sender account (external nonReentrant)
    * @param amount The amount of attoDai to repay
    */
    function repayAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "repaid zero attoDai");

        applyBorrowedAttoDaiInterest(msg.sender);
        require(amount <= accounts[msg.sender].attoDai.borrowed, "repaid more attoDai than borrowed");
        accounts[msg.sender].attoDai.borrowed = accounts[msg.sender].attoDai.borrowed.sub(amount);

        totalAttoDai.borrowed = totalAttoDai.borrowed.sub(amount);

        require(Token.transferFrom(daiAddress, msg.sender, amount), "dai transfer failed");

        emit AttoDaiRepaid(msg.sender, amount);
    }

    /**
    * @notice Apply the interest accumulated (since last applied) to the supplied attoDai balance of the given account (public)
    * param accountAddress The address of the account to apply interest to
    */
    function applySuppliedAttoDaiInterest(address accountAddress) public {
        require(accountAddress != address(0), "applied interest to address 0x0");

        // TODO: implement and test. Update lastApplied block number
        uint256 interest = calculateSuppliedAttoDaiInterest(accounts[accountAddress]);
        accounts[accountAddress].attoDai.supplied = accounts[accountAddress].attoDai.supplied.add(interest);
        totalAttoDai.supplied = totalAttoDai.supplied.add(interest);
        emit SuppliedAttoDaiInterestApplied(accountAddress);
    }

    /**
    * @notice Apply the interest accumulated (since last applied) to the borrowed attoDai balance of the given account (public)
    * param accountAddress The address of the account to apply interest to
    */
    function applyBorrowedAttoDaiInterest(address accountAddress) public {
        require(accountAddress != address(0), "applied interest to address 0x0");

        // TODO: implement and test. Update lastApplied block number
        uint256 interest = calculateBorrowedAttoDaiInterest(accounts[accountAddress]);
        accounts[accountAddress].attoDai.borrowed = accounts[accountAddress].attoDai.borrowed.add(interest);
        totalAttoDai.borrowed = totalAttoDai.borrowed.add(interest);
        emit BorrowedAttoDaiInterestApplied(accountAddress);
    }
}
