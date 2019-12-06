pragma solidity 0.5.12;
pragma experimental ABIEncoderV2;

import { ICollateral } from "../interfaces/ICollateral.sol";
import { SafeMath } from "../lib/SafeMath.sol";
import { Types } from "../lib/Types.sol";
import { WeiAttoDaiPriceFeed } from "./WeiAttoDaiPriceFeed.sol";

/**
* @title DaiFiCollateral Contract
* @notice Abstract contract defining collateral requirements
* @author DaiFi
*/
contract DaiFiCollateral is ICollateral, WeiAttoDaiPriceFeed {
    using SafeMath for uint256;

    /**
    * @notice The number of basis points in 100% (private constant)
    */
     uint256 private constant BASIS_POINTS = 10000;

    /**
    * @notice The minimum ratio of collateral (in basis points) that must be supplied in order to borrow (private constant)
    */
     uint256 private constant COLLATERALISATION_RATIO = 15000;

    /**
    * @notice The minimum ratio of collateral (in basis points) that must be supplied in order not to be liquidated (private constant)
    */
     uint256 private constant LIQUIDISATION_RATIO = 12500;

    /**
    * @notice Apply the collateralisation ratio to the given amount (private pure)
    * @param amount The amount
    * @return The collateralisation threshold
    */
    function applyCollateralisationRatio(uint256 amount) private pure returns (uint256) {
        return amount.mul(COLLATERALISATION_RATIO).div(BASIS_POINTS);
    }

    /**
    * @notice Apply the liquidisation ratio to the given amount (private pure)
    * @param amount The amount
    * @return The liquidisation threshold
    */
    function applyLiquidisationRatio(uint256 amount) private pure returns (uint256) {
        return amount.mul(LIQUIDISATION_RATIO).div(BASIS_POINTS);
    }

    /**
     * @notice internal constructor to make abstract (internal)
     * @param daiPriceOracle The address of the Dai price oracle
     */
    constructor(address daiPriceOracle) WeiAttoDaiPriceFeed(daiPriceOracle) internal {}

    /**
    * @notice Determine if the given account has sufficient collateral for amount of Wei borrowed (public view)
    * @param account The account to check
    * @return True if sufficiently collateralised
    */
    function isCollateralisedForWei(Types.Account memory account) public view returns (bool) {
        return account.wei_.borrowed == 0 ||
            applyCollateralisationRatio(account.wei_.borrowed) < getLatestBasePrice(account.attoDai.supplied);
    }

    /**
    * @notice Determine if the given account has sufficient collateral for amount of attoDai borrowed (public view)
    * @param account The account to check
    * @return True if sufficiently collateralised
    */
    function isCollateralisedForAttoDai(Types.Account memory account) public view returns (bool) {
        return account.attoDai.borrowed == 0 ||
            applyCollateralisationRatio(account.attoDai.borrowed) < getLatestQuotePrice(account.wei_.supplied);
    }

    /**
    * @notice Determine if the given account is insufficiently collateralised and can be liquidated (public view)
    * @param account The account to check
    * @return True if can be liquidated
    */
    function canBeLiquidated(Types.Account memory account) public view returns (bool) {
        return getLatestBasePrice(account.attoDai.supplied) < applyLiquidisationRatio(account.wei_.borrowed) ||
            getLatestQuotePrice(account.wei_.supplied) < applyLiquidisationRatio(account.attoDai.borrowed);
    }
}
