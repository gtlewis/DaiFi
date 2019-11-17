pragma solidity 0.5.12;

import { IPriceFeed } from "../interfaces/IPriceFeed.sol";

/**
* @title WeiAttoDaiPriceFeed Contract
* @notice Abstract contract for retrieving Wei price in attoDai 
* @author DaiFi
*/
contract WeiAttoDaiPriceFeed is IPriceFeed {

    /**
     * @notice internal constructor to make abstract (internal)
     */
    constructor() internal {}

    /**
    * @notice Gets the latest price from the feed (public pure)
    * @return The latest price
    */
    function getLatestPrice() public pure returns (uint256) {
        // TODO: for now just return 200
        // TODO: revert if 0
        return 200;
    }
}
