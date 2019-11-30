pragma solidity 0.5.12;

/**
* @title MockAboveMaxDaiPriceOracle Contract
* @notice Mock Dai price oracle that returns a price of 2^128
* @dev Used for testing only
* @author DaiFi
*/
contract MockAboveMaxDaiPriceOracle {

    /**
    * @notice Returns the price from the oracle (external pure)
    * @dev Always returns a price of 2^128 attoDai per Eth
    * @return The price
    */
    function read() external pure returns (uint256) {
        return 2**128;
    }
}
