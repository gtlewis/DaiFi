pragma solidity 0.5.12;

/**
* @title IActions Interface
* @notice Interface for the supported DaiFi actions
* @author DaiFi
*/
interface IActions {

    /**
    * @notice Supply Wei from sender account (external payable)
    */
    function supplyWei() external payable;

    /**
    * @notice Withdraw Wei to sender account (external)
    * @param amount The amount of Wei to withdraw
    */
    function withdrawWei(uint256 amount) external;

    /**
    * @notice Supply attoDai from sender account (external)
    * @param amount The amount of attoDai to supply
    */
    function supplyAttoDai(uint256 amount) external;

    /**
    * @notice Withdraw attoDai to sender account (external)
    * @param amount The amount of attoDai to withdraw
    */
    function withdrawAttoDai(uint256 amount) external;

    /**
    * @notice Borrow Wei to sender account (external)
    * @param amount The amount of Wei to borrow
    */
    function borrowWei(uint256 amount) external;

    /**
    * @notice Repay Wei from sender account (external payable)
    */
    function repayWei() external payable;

    /**
    * @notice Borrow attoDai to sender account (external)
    * @param amount The amount of attoDai to borrow
    */
    function borrowAttoDai(uint256 amount) external;

    /**
    * @notice Repay attoDai from sender account (external)
    * @param amount The amount of attoDai to repay
    */
    function repayAttoDai(uint256 amount) external;

    /**
     * @notice Event emitted when Wei supplied
     */
    event WeiSupplied(address account, uint256 amount);

    /**
     * @notice Event emitted when Wei withdrawn
     */
    event WeiWithdrawn(address account, uint256 amount);

    /**
     * @notice Event emitted when AttoDai supplied
     */
    event AttoDaiSupplied(address account, uint256 amount);

    /**
     * @notice Event emitted when AttoDai withdrawn
     */
    event AttoDaiWithdrawn(address account, uint256 amount);

    /**
     * @notice Event emitted when Wei borrowed
     */
    event WeiBorrowed(address account, uint256 amount);

    /**
     * @notice Event emitted when Wei repaid
     */
    event WeiRepaid(address account, uint256 amount);

    /**
     * @notice Event emitted when attoDai borrowed
     */
    event AttoDaiBorrowed(address account, uint256 amount);

    /**
     * @notice Event emitted when attoDai repaid
     */
    event AttoDaiRepaid(address account, uint256 amount);
}
