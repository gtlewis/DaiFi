pragma solidity 0.5.12;
pragma experimental ABIEncoderV2;

import { DaiFiActions } from "./implementations/DaiFiActions.sol";
import { Types } from "./lib/Types.sol";

/**
* @title DaiFi Contract
* @notice The DaiFi main contract
* @author DaiFi
*/
contract DaiFi is DaiFiActions {

    /**
     * @notice constructor sets the Dai contract address from the given address (public)
     * @param daiAddress The address of the Dai token
     */
    constructor(address daiAddress) DaiFiActions(daiAddress) public {}

    /**
     * @notice Gets the balances of total Wei (external view)
     * @return The total Wei balances
     */
    function getTotalWei() external view returns (Types.Balances memory) {
        return totalWei;
    }

    /**
     * @notice Gets the balances of total attoDai (external view)
     * @return The total attoDai balances
     */
    function getTotalAttoDai() external view returns (Types.Balances memory) {
        return totalAttoDai;
    }

    /**
     * @notice Gets the account for the given address (external view)
     * @param accountAddress The address of the account
     * @return The account
     */
    function getAccount(address accountAddress) external view returns (Types.Account memory) {
        return accounts[accountAddress];
    }
}

// TODO: add withdraw (and repay!) abstract supply / borrow / dai / wei???
// TODO: abstract supplying and borrowing across wei/dai?
// TODO: DO BORROW!!!
// TODO: timelocked admin?
// TODO: abstracted interest rate model / price oracle / etc.
// TODO: Unittroller pattern??? prob not...
