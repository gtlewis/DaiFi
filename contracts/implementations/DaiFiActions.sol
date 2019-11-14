pragma solidity 0.5.12;

import { IActions } from "../interfaces/IActions.sol";
import { ReentrancyGuard } from "../lib/ReentrancyGuard.sol";
import { SafeMath } from "../lib/SafeMath.sol";
import { Token } from "../lib/Token.sol";
import { Types } from "../lib/Types.sol";

/**
* @title DaiFiActions Contract
* @notice Abstract contract for supported DaiFi actions
* @author DaiFi
*/
contract DaiFiActions is IActions, ReentrancyGuard {
    using SafeMath for uint256;

    /**
    * @notice The Dai contract address (internal)
    */
    address internal daiAddress;

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
     */
    constructor(address daiAddress_) internal {
        daiAddress = daiAddress_;
    }

    /**
    * @notice Supply Wei from sender account (external payable nonReentrant)
    */
    function supplyWei() external payable nonReentrant {
        require(msg.value != 0, "supplied zero Wei");

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
        require(amount <= accounts[msg.sender].wei_.supplied, "withdrew more Wei than supplied");

        // TODO: check collateral whenever increase borrowing or lower supply!

        msg.sender.transfer(amount);

        accounts[msg.sender].wei_.supplied = accounts[msg.sender].wei_.supplied.sub(amount);
        totalWei.supplied = totalWei.supplied.sub(amount);

        emit WeiWithdrawn(msg.sender, amount);
    }

    /**
    * @notice Supply attoDai from sender account (external nonReentrant)
    * @param amount The amount of attoDai to supply
    */
    function supplyAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "supplied zero attoDai");

        require(Token.transferFrom(daiAddress, msg.sender, amount), "dai transfer failed");

        accounts[msg.sender].attoDai.supplied = accounts[msg.sender].attoDai.supplied.add(amount);
        totalAttoDai.supplied = totalAttoDai.supplied.add(amount);

        emit AttoDaiSupplied(msg.sender, amount);
    }

    /**
    * @notice Withdraw attoDai to sender account (external nonReentrant)
    * @param amount The amount of attoDai to withdraw
    */
    function withdrawAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "withdrew zero attoDai");
        require(amount <= accounts[msg.sender].attoDai.supplied, "withdrew more attoDai than supplied");

        // TODO: check collateral whenever increase borrowing or lower supply!

        require(Token.transferTo(daiAddress, msg.sender, amount), "dai transfer failed");

        accounts[msg.sender].attoDai.supplied = accounts[msg.sender].attoDai.supplied.sub(amount);
        totalAttoDai.supplied = totalAttoDai.supplied.sub(amount);

        emit AttoDaiWithdrawn(msg.sender, amount);
    }

    /**
    * @notice Borrow Wei to sender account (external nonReentrant)
    * @param amount The amount of Wei to borrow
    */
    function borrowWei(uint256 amount) external nonReentrant {
        require(amount != 0, "borrowed zero Wei");

        // TODO: check collateral whenever increase borrowing or lower supply!

        msg.sender.transfer(amount);

        accounts[msg.sender].wei_.borrowed = accounts[msg.sender].wei_.borrowed.add(amount);
        totalWei.borrowed = totalWei.borrowed.add(amount);

        emit WeiBorrowed(msg.sender, amount);
    }

    /**
    * @notice Repay Wei from sender account (external payable nonReentrant)
    */
    function repayWei() external payable nonReentrant {
        require(msg.value != 0, "repaid zero Wei");
        require(msg.value <= accounts[msg.sender].wei_.borrowed, "repaid more Wei than borrowed");

        accounts[msg.sender].wei_.borrowed = accounts[msg.sender].wei_.borrowed.sub(msg.value);
        totalWei.borrowed = totalWei.borrowed.sub(msg.value);

        emit WeiRepaid(msg.sender, msg.value);
    }

    /**
    * @notice Borrow attoDai to sender account (external nonReentrant)
    * @param amount The amount of attoDai to borrow
    */
    function borrowAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "borrowed zero attoDai");

        // TODO: check collateral whenever increase borrowing or lower supply!

        require(Token.transferTo(daiAddress, msg.sender, amount), "dai transfer failed");

        accounts[msg.sender].attoDai.borrowed = accounts[msg.sender].attoDai.borrowed.add(amount);
        totalAttoDai.borrowed = totalAttoDai.borrowed.add(amount);

        emit AttoDaiBorrowed(msg.sender, amount);
    }

    /**
    * @notice Repay attoDai from sender account (external nonReentrant)
    * @param amount The amount of attoDai to repay
    */
    function repayAttoDai(uint256 amount) external nonReentrant {
        require(amount != 0, "repaid zero attoDai");
        require(amount <= accounts[msg.sender].attoDai.borrowed, "repaid more attoDai than borrowed");

        require(Token.transferFrom(daiAddress, msg.sender, amount), "dai transfer failed");

        accounts[msg.sender].attoDai.borrowed = accounts[msg.sender].attoDai.borrowed.sub(amount);
        totalAttoDai.borrowed = totalAttoDai.borrowed.sub(amount);

        emit AttoDaiRepaid(msg.sender, amount);
    }
}
