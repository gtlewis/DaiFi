pragma solidity 0.5.12;
pragma experimental ABIEncoderV2;

import { IInterest } from "../interfaces/IInterest.sol";
import { SafeMath } from "../lib/SafeMath.sol";
import { Types } from "../lib/Types.sol";

/**
* @title DaiFiInterest Contract
* @notice Abstract contract for calculating interest on supplied and borrowed balances
* @author DaiFi
*/
contract DaiFiInterest is IInterest {
    using SafeMath for uint256;

    /**
    * @notice The number of attobasis points in 100% (private constant)
    */
     uint256 private constant ATTOBASIS_POINTS = 10000000000000000000000;

    /**
     * @notice internal constructor to make abstract (internal)
     */
    constructor() internal {}

    /**
    * @notice Returns the current per block interest rate (in attobasis points) on supplied Wei (public pure)
    * @return The current interest rate
    */
    function getSuppliedWeiInterestRate() public pure returns (uint256) {
        // TODO: implement and test, for now 1% (!) per block
        return 100000000000000000000;
    }

    /**
    * @notice Returns the current per block interest rate on borrowed Wei (public pure)
    * @return The current interest rate
    */
    function getBorrowedWeiInterestRate() public pure returns (uint256) {
        // TODO: implement and test, for now 1% (!) per block
        return 100000000000000000000;
    }

    /**
    * @notice Returns the current per block interest rate on supplied attoDai (public pure)
    * @return The current interest rate
    */
    function getSuppliedAttoDaiInterestRate() public pure returns (uint256) {
        // TODO: implement and test, for now 1% (!) per block
        return 100000000000000000000;
    }

    /**
    * @notice Returns the current per block interest rate on borrowed attoDai (public pure)
    * @return The current interest rate
    */
    function getBorrowedAttoDaiInterestRate() public pure returns (uint256) {
        // TODO: implement and test, for now 1% (!) per block
        return 100000000000000000000;
    }

    /**
    * @notice Calculate the interest accumulated (since last applied) to the supplied Wei balance of the given account (public pure)
    * @param account The account to calculate interest for
    * @return The amount of Wei accumulated in interest
    */
    function calculateSuppliedWeiInterest(Types.Account memory account) public pure returns (uint256) {
        // TODO: implement and test, for now assume 1 block has passed
        return account.wei_.supplied.mul(getSuppliedWeiInterestRate()).div(ATTOBASIS_POINTS);
    }

    /**
    * @notice Calculate the interest accumulated (since last applied) to the borrowed Wei balance of the given account (public pure)
    * @param account The account to calculate interest for
    * @return The amount of Wei accumulated in interest
    */
    function calculateBorrowedWeiInterest(Types.Account memory account) public pure returns (uint256) {
        // TODO: implement and test, for now assume 1 block has passed
        return account.wei_.borrowed.mul(getBorrowedWeiInterestRate()).div(ATTOBASIS_POINTS);
    }

    /**
    * @notice Calculate the interest accumulated (since last applied) to the supplied attoDai balance of the given account (public pure)
    * @param account The account to calculate interest for
    * @return The amount of attoDai accumulated in interest
    */
    function calculateSuppliedAttoDaiInterest(Types.Account memory account) public pure returns (uint256) {
        // TODO: implement and test, for now assume 1 block has passed
        return account.attoDai.supplied.mul(getSuppliedAttoDaiInterestRate()).div(ATTOBASIS_POINTS);
    }

    /**
    * @notice Calculate the interest accumulated (since last applied) to the borrowed attoDai balance of the given account (public pure)
    * @param account The account to calculate interest for
    * @return The amount of attoDai accumulated in interest
    */
    function calculateBorrowedAttoDaiInterest(Types.Account memory account) public pure returns (uint256) {
        // TODO: implement and test, for now assume 1 block has passed
        return account.attoDai.borrowed.mul(getBorrowedAttoDaiInterestRate()).div(ATTOBASIS_POINTS);
    }
}
