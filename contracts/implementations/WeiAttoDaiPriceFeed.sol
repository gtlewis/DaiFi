pragma solidity 0.5.12;

import { IPriceFeed } from "../interfaces/IPriceFeed.sol";
import { SafeMath } from "../lib/SafeMath.sol";

/**
* @title WeiAttoDaiPriceFeed Contract
* @notice Abstract contract for retrieving Wei price in attoDai and attoDai price in Wei
* @author DaiFi
*/
contract WeiAttoDaiPriceFeed is IPriceFeed {
    using SafeMath for uint256;

    /**
     * @notice internal constructor to make abstract (internal)
     */
    constructor() internal {}

    /**
    * @notice Returns the latest price from the feed of attoDai for the given amount of Wei (public pure)
    * @param amount The amount of Wei
    * @return The latest attoDai price
    */
    function getLatestQuotePrice(uint256 amount) public pure returns (uint256) {
        // TODO: for now just return 234.567890123456789012
        // TODO: revert if 0
        return amount.mul(234567890123456789012).div(1000000000000000000);
    }

    /**
    * @notice Returns the latest price from the feed of Wei for the given amount of attoDai (public pure)
    * @param amount The amount of attoDai
    * @return The latest Wei price
    */
    function getLatestBasePrice(uint256 amount) public pure returns (uint256) {
        // TODO: for now just return 1/234.567890123456789012
        // TODO: revert if 0
        return amount.mul(1000000000000000000).div(234567890123456789012);
    }
}
