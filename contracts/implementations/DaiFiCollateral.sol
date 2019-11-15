pragma solidity 0.5.12;
pragma experimental ABIEncoderV2;

import { ICollateral } from "../interfaces/ICollateral.sol";
import { Types } from "../lib/Types.sol";

/**
* @title DaiFiCollateral Contract
* @notice Abstract contract defining collateral requirements
* @author DaiFi
*/
contract DaiFiCollateral is ICollateral {

    /**
     * @notice internal constructor to make abstract (internal)
     */
    constructor() internal {}

    /**
    * @notice Determine if the given account has sufficient collateral for amount of Wei borrowed (public pure)
    * @param account The account to check
    * @return True if sufficiently collateralised
    */
    function isCollateralisedForWei(Types.Account memory account) public pure returns (bool) {
        // TODO: for now just supplied more attoDai than wei borrowed
        return account.wei_.borrowed == 0 || account.attoDai.supplied > account.wei_.borrowed;

        // TODO: Price feed
        // TODO: Multiply by 150%? 125%?
        // TODO: need parameters check?
    }

    /**
    * @notice Determine if the given account has sufficient collateral for amount of attoDai borrowed (public pure)
    * @param account The account to check
    * @return True if sufficiently collateralised
    */
    function isCollateralisedForAttoDai(Types.Account memory account) public pure returns (bool) {
        // TODO: for now just supplied more wei than attoDai borrowed
        return account.attoDai.borrowed == 0 || account.wei_.supplied > account.attoDai.borrowed;
    }

    /**
    * @notice Determine if the given account is insufficiently collateralised and can be liquidated (public pure)
    * @param account The account to check
    * @return True if can be liquidated
    */
    function canBeLiquidated(Types.Account memory account) public pure returns (bool) {
        // TODO: for now just supplied less than borrowed
        return (account.attoDai.supplied < account.wei_.borrowed) || (account.wei_.supplied < account.attoDai.borrowed) ;
    }
}
