pragma solidity 0.5.12;
pragma experimental ABIEncoderV2;

import { Types } from "../lib/Types.sol";

/**
* @title Collateral Interface
* @notice Interface for the collateral requirements
* @author DaiFi
*/
interface ICollateral {

    /**
    * @notice Determine if the given account has sufficient collateral for amount of Wei borrowed (external view)
    * @param account The account to check
    * @return True if sufficiently collateralised
    */
    function isCollateralisedForWei(Types.Account calldata account) external view returns (bool);

    /**
    * @notice Determine if the given account has sufficient collateral for amount of attoDai borrowed (external view)
    * @param account The account to check
    * @return True if sufficiently collateralised
    */
    function isCollateralisedForAttoDai(Types.Account calldata account) external view returns (bool);

    /**
    * @notice Determine if the given account is insufficiently collateralised and can be liquidated (external view)
    * @param account The account to check
    * @return True if can be liquidated
    */
    function canBeLiquidated(Types.Account calldata account) external view returns (bool);
}
