pragma solidity 0.5.12;

/**
* @title PriceOracle Interface
* @notice Interface for a price oracle
* @author DaiFi
*/
interface IPriceOracle {

    /**
    * @notice Returns the latest price from the oracle (external pure)
    * @return The latest price
    */
    function read() external pure returns (uint256);
}
