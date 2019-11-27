pragma solidity 0.5.12;

/**
* @title MockZeroDaiPriceOracle Contract
* @notice Mock Dai price oracle that returns a price of 0
* @dev Used for testing only
* @author DaiFi
*/
contract MockZeroDaiPriceOracle {

    /**
    * @notice Returns the price from the oracle (external pure)
    * @dev Always returns a price of 0 attoDai per Eth
    * @return The price
    */
    function read() external pure returns (uint256) {
        return 0;
    }
}
