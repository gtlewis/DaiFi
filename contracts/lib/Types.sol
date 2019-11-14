pragma solidity 0.5.12;

/**
* @title Types Library
* @notice Library for representing different types 
* @author DaiFi
*/
library Types {

    /**
     * @notice Type for holding supplied and borrowed balances
     * @member supplied The amount supplied
     * @member borrowed The amount borrowed
     */
    struct Balances {
        uint256 supplied;
        uint256 borrowed;
    }

    /**
     * @notice Type for representing an account
     * @member _wei The Wei balances
     * @member attoDai The attoDai balances
     */
    struct Account {
        Balances wei_;
        Balances attoDai;
    }
}
