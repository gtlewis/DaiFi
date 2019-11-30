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
     * @notice internal constructor to make abstract (internal)
     */
    constructor() internal {}

    /**
    * @notice Returns the current interest rate on supplied Wei (public pure)
    * @return The current interest rate
    */
    function getSuppliedWeiInterestRate() public pure returns (uint256) {
        // TODO: implement and test
        return 1;
    }

    /**
    * @notice Returns the current interest rate on borrowed Wei (public pure)
    * @return The current interest rate
    */
    function getBorrowedWeiInterestRate() public pure returns (uint256) {
        // TODO: implement and test
        return 1;
    }

    /**
    * @notice Returns the current interest rate on supplied attoDai (public pure)
    * @return The current interest rate
    */
    function getSuppliedAttoDaiInterestRate() public pure returns (uint256) {
        // TODO: implement and test
        return 1;
    }

    /**
    * @notice Returns the current interest rate on borrowed attoDai (public pure)
    * @return The current interest rate
    */
    function getBorrowedAttoDaiInterestRate() public pure returns (uint256) {
        // TODO: implement and test
        return 1;
    }

    /**
    * @notice Calculate the interest accumulated (since last applied) to the supplied Wei balance of the given account (public pure)
    * @param account The account to calcuate interest for
    * @return The amount of Wei accumulated in interest
    */
    function calculateSuppliedWeiInterest(Types.Account memory account) public pure returns (uint256) {
        // TODO: implement and test
        return account.wei_.supplied.mul(getSuppliedWeiInterestRate());
    }

    /**
    * @notice Calculate the interest accumulated (since last applied) to the borrowed Wei balance of the given account (public pure)
    * @param account The account to calcuate interest for
    * @return The amount of Wei accumulated in interest
    */
    function calculateBorrowedWeiInterest(Types.Account memory account) public pure returns (uint256) {
        // TODO: implement and test
        return account.wei_.borrowed.mul(getBorrowedWeiInterestRate());
    }

    /**
    * @notice Calculate the interest accumulated (since last applied) to the supplied attoDai balance of the given account (public pure)
    * @param account The account to calcuate interest for
    * @return The amount of attoDai accumulated in interest
    */
    function calculateSuppliedAttoDaiInterest(Types.Account memory account) public pure returns (uint256) {
        // TODO: implement and test
        return account.attoDai.supplied.mul(getSuppliedAttoDaiInterestRate());
    }

    /**
    * @notice Calculate the interest accumulated (since last applied) to the borrowed attoDai balance of the given account (public pure)
    * @param account The account to calcuate interest for
    * @return The amount of attoDai accumulated in interest
    */
    function calculateBorrowedAttoDaiInterest(Types.Account memory account) public pure returns (uint256) {
        // TODO: implement and test
        return account.attoDai.borrowed.mul(getBorrowedAttoDaiInterestRate());
    }
}
