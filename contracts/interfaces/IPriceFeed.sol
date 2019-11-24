pragma solidity 0.5.12;

/**
* @title PriceFeed Interface
* @notice Interface for price feeds
* @author DaiFi
*/
interface IPriceFeed {

    /**
    * @notice Returns the latest price from the feed of the quote token for the given amount of the base token (external pure)
    * @dev implementations should revert if the price can not be retrieved
    * @param amount The amount of the base token
    * @return The latest quote price
    */
    function getLatestQuotePrice(uint256 amount) external pure returns (uint256);

    /**
    * @notice Returns the latest price from the feed of the base token for the given amount of the quote token (external pure)
    * @dev implementations should revert if the price can not be retrieved
    * @param amount The amount of the quote token
    * @return The latest base price
    */
    function getLatestBasePrice(uint256 amount) external pure returns (uint256);
}
