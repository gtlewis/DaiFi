pragma solidity 0.5.12;
pragma experimental ABIEncoderV2;

import { Types } from "../lib/Types.sol";

/**
* @title IInterest Interface
* @notice Interface for calculating interest on supplied and borrowed balances
* @author DaiFi
*/
interface IInterest {

    /**
    * @notice Returns the current interest rate on supplied Wei (external pure)
    * @return The current interest rate
    */
    function getSuppliedWeiInterestRate() external pure returns (uint256);

    /**
    * @notice Returns the current interest rate on borrowed Wei (external pure)
    * @return The current interest rate
    */
    function getBorrowedWeiInterestRate() external pure returns (uint256);

    /**
    * @notice Returns the current interest rate on supplied attoDai (external pure)
    * @return The current interest rate
    */
    function getSuppliedAttoDaiInterestRate() external pure returns (uint256);

    /**
    * @notice Returns the current interest rate on borrowed attoDai (external pure)
    * @return The current interest rate
    */
    function getBorrowedAttoDaiInterestRate() external pure returns (uint256);

    /**
    * @notice Calculate the interest accumulated (since last applied) to the supplied Wei balance of the given account (external pure)
    * @param account The account to calculate interest for
    * @return The amount of Wei accumulated in interest
    */
    function calculateSuppliedWeiInterest(Types.Account calldata account) external pure returns (uint256);

    /**
    * @notice Calculate the interest accumulated (since last applied) to the borrowed Wei balance of the given account (external pure)
    * @param account The account to calculate interest for
    * @return The amount of Wei accumulated in interest
    */
    function calculateBorrowedWeiInterest(Types.Account calldata account) external pure returns (uint256);

    /**
    * @notice Calculate the interest accumulated (since last applied) to the supplied attoDai balance of the given account (external pure)
    * @param account The account to calculate interest for
    * @return The amount of attoDai accumulated in interest
    */
    function calculateSuppliedAttoDaiInterest(Types.Account calldata account) external pure returns (uint256);

    /**
    * @notice Calculate the interest accumulated (since last applied) to the borrowed attoDai balance of the given account (external pure)
    * @param account The account to calculate interest for
    * @return The amount of attoDai accumulated in interest
    */
    function calculateBorrowedAttoDaiInterest(Types.Account calldata account) external pure returns (uint256);
}
