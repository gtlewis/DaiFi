pragma solidity 0.5.12;

import { IPriceFeed } from "../interfaces/IPriceFeed.sol";
import { IPriceOracle } from "../interfaces/IPriceOracle.sol";
import { SafeMath } from "../lib/SafeMath.sol";

/**
* @title WeiAttoDaiPriceFeed Contract
* @notice Abstract contract for retrieving Wei price in attoDai and attoDai price in Wei
* @author DaiFi
*/
contract WeiAttoDaiPriceFeed is IPriceFeed {
    using SafeMath for uint256;

    /**
    * @notice The number of Wei in 1 Eth (private constant)
    */
     uint256 private constant ETH_TO_WEI = 1000000000000000000;

    /**
    * @notice The Dai price oracle address (private)
    */
    address private daiPriceOracle;

    /**
     * @notice internal constructor to make abstract (internal)
     * @param daiPriceOracle_ The address of the Dai price oracle
     */
    constructor(address daiPriceOracle_) internal {
        daiPriceOracle = daiPriceOracle_;
    }

    /**
    * @notice Reads the latest price from the Dai price oracle (private view)
    * @dev requires the price to be non-zero and less than 2^128
    * @return The latest Wei price
    */
    function readPrice() private view returns (uint256) {
        uint256 attoDaiPerEth = IPriceOracle(daiPriceOracle).read();
        require(attoDaiPerEth != 0 && attoDaiPerEth == uint128(attoDaiPerEth), "invalid Dai price");
        return attoDaiPerEth;
    }

    /**
    * @notice Returns the latest price from the feed of attoDai for the given amount of Wei (public view)
    * @param amount The amount of Wei
    * @return The latest attoDai price
    */
    function getLatestQuotePrice(uint256 amount) public view returns (uint256) {
        return amount.mul(readPrice()).div(ETH_TO_WEI);
    }

    /**
    * @notice Returns the latest price from the feed of Wei for the given amount of attoDai (public view)
    * @param amount The amount of attoDai
    * @return The latest Wei price
    */
    function getLatestBasePrice(uint256 amount) public view returns (uint256) {
        return amount.mul(ETH_TO_WEI).div(readPrice());
    }
}
