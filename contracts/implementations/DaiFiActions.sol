pragma solidity 0.5.12;
pragma experimental ABIEncoderV2;

import { IActions } from "../interfaces/IActions.sol";
import { DaiFiCollateral } from "./DaiFiCollateral.sol";
import { ReentrancyGuard } from "../lib/ReentrancyGuard.sol";
import { SafeMath } from "../lib/SafeMath.sol";
import { Token } from "../lib/Token.sol";
import { Types } from "../lib/Types.sol";

/**
* @title DaiFiActions Contract
* @notice Abstract contract for supported DaiFi actions
* @author DaiFi
*/
contract DaiFiActions is IActions, DaiFiCollateral, ReentrancyGuard {
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

        totalWei.supplied = totalWei.supplied.add(msg.value);
        accounts[msg.sender].wei_.supplied = accounts[msg.sender].wei_.supplied.add(msg.value);

        emit WeiSupplied(msg.sender, msg.value);
    }

    /**
    * @notice Withdraw Wei to sender account (external nonReentrant)
    * @param amount The amount of Wei to withdraw
    */
    function withdrawWei(uint256 amount) external nonReentrant {
        require(amount != 0, "withdrew zero Wei");
        require(amount <= accounts[msg.sender].wei_.supplied, "withdrew more Wei than supplied");

        totalWei.supplied = totalWei.supplied.sub(amount);
        accounts[msg.sender].wei_.supplied = accounts[msg.sender].wei_.supplied.sub(amount);
        require(isCollateralisedForAttoDai(accounts[msg.sender]), "not enough collateral");

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

        totalWei.borrowed = totalWei.borrowed.add(amount);
        accounts[msg.sender].wei_.borrowed = accounts[msg.sender].wei_.borrowed.add(amount);
        require(isCollateralisedForWei(accounts[msg.sender]), "not enough collateral");

        msg.sender.transfer(amount);

        emit WeiBorrowed(msg.sender, amount);
    }

    /**
    * @notice Repay Wei from sender account (external payable nonReentrant)
    */
    function repayWei() external payable nonReentrant {
        require(msg.value != 0, "repaid zero Wei");
        require(msg.value <= accounts[msg.sender].wei_.borrowed, "repaid more Wei than borrowed");

        totalWei.borrowed = totalWei.borrowed.sub(msg.value);
        accounts[msg.sender].wei_.borrowed = accounts[msg.sender].wei_.borrowed.sub(msg.value);

        emit WeiRepaid(msg.sender, msg.value);
    }

    /**
    * @notice Supply attoDai from sender account (external nonReentrant)
    * @param amount The amount of attoDai to supply
    */
    function supplyAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "supplied zero attoDai");
        require(accounts[msg.sender].attoDai.borrowed == 0, "supplied attoDai when already borrowing");

        totalAttoDai.supplied = totalAttoDai.supplied.add(amount);
        accounts[msg.sender].attoDai.supplied = accounts[msg.sender].attoDai.supplied.add(amount);

        require(Token.transferFrom(daiAddress, msg.sender, amount), "dai transfer failed");

        emit AttoDaiSupplied(msg.sender, amount);
    }

    /**
    * @notice Withdraw attoDai to sender account (external nonReentrant)
    * @param amount The amount of attoDai to withdraw
    */
    function withdrawAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "withdrew zero attoDai");
        require(amount <= accounts[msg.sender].attoDai.supplied, "withdrew more attoDai than supplied");

        totalAttoDai.supplied = totalAttoDai.supplied.sub(amount);
        accounts[msg.sender].attoDai.supplied = accounts[msg.sender].attoDai.supplied.sub(amount);
        require(isCollateralisedForWei(accounts[msg.sender]), "not enough collateral");

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

        totalAttoDai.borrowed = totalAttoDai.borrowed.add(amount);
        accounts[msg.sender].attoDai.borrowed = accounts[msg.sender].attoDai.borrowed.add(amount);
        require(isCollateralisedForAttoDai(accounts[msg.sender]), "not enough collateral");

        require(Token.transferTo(daiAddress, msg.sender, amount), "dai transfer failed");

        emit AttoDaiBorrowed(msg.sender, amount);
    }

    /**
    * @notice Repay attoDai from sender account (external nonReentrant)
    * @param amount The amount of attoDai to repay
    */
    function repayAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "repaid zero attoDai");
        require(amount <= accounts[msg.sender].attoDai.borrowed, "repaid more attoDai than borrowed");

        totalAttoDai.borrowed = totalAttoDai.borrowed.sub(amount);
        accounts[msg.sender].attoDai.borrowed = accounts[msg.sender].attoDai.borrowed.sub(amount);

        require(Token.transferFrom(daiAddress, msg.sender, amount), "dai transfer failed");

        emit AttoDaiRepaid(msg.sender, amount);
    }
}
