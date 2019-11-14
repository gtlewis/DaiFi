pragma solidity 0.5.12;

import { IERC20 } from "../interfaces/IERC20.sol";

/**
* @title Token Library
* @notice Library for accessing supported Tokens 
* @author DaiFi
*/
library Token {

    /**
    * @notice Get ERC20 token contract at given address (private pure)
    * @param tokenAddress The address of the ERC20 token
    * @return The ERC20 token contract
    */
    function getERC20(address tokenAddress) private pure returns (IERC20) {
        return IERC20(tokenAddress);
    }

    /**
    * @notice Transfer tokens from sender to self (internal)
    * @param tokenAddress The address of the ERC20 token
    * @param sender The sender of the token
    * @param amount The amount of the token to send
    * @return True if successful
    */
    function transferFrom(address tokenAddress, address sender, uint256 amount) internal returns (bool) {
        return getERC20(tokenAddress).transferFrom(sender, address(this), amount);
    }

    /**
    * @notice Transfer tokens from self to sender (internal)
    * @param tokenAddress The address of the ERC20 token
    * @param recipient The recipient of the token
    * @param amount The amount of the token to send
    * @return True if successful
    */
    function transferTo(address tokenAddress, address recipient, uint256 amount) internal returns (bool) {
        return getERC20(tokenAddress).transfer(recipient, amount);
    }
}
