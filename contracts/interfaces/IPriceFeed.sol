pragma solidity 0.5.12;

/**
* @title PriceFeed Interface
* @notice Interface for price feeds
* @author DaiFi
*/
interface IPriceFeed {

    /**
    * @notice Gets the latest price from the feed (external pure)
    * @dev implementations should revert if the price can not be retrieved
    * @return The latest price
    */
    function getLatestPrice() external pure returns (uint256);
}
