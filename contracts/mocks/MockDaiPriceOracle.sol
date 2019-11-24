pragma solidity 0.5.12;

/**
* @title MockDaiPriceOracle Contract
* @notice Mock Dai price oracle that returns a realistic price
* @dev Used for testing only
* @author DaiFi
*/
contract MockDaiPriceOracle {

    /**
    * @notice Returns the price from the oracle (external pure)
    * @dev Always returns a price of 234567890123456789012 attoDai per Eth
    * @return The price
    */
    function read() external pure returns (uint256) {
        return 234567890123456789012;
    }
}
