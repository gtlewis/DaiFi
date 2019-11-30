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
    * @notice Borrow Wei to sender account (external)
    * @param amount The amount of Wei to borrow
    */
    function borrowWei(uint256 amount) external;

    /**
    * @notice Repay Wei from sender account (external payable)
    */
    function repayWei() external payable;

    /**
    * @notice Apply the interest accumulated (since last applied) to the supplied Wei balance of the given account (external)
    * param accountAddress The address of the account to apply interest to
    */
    function applySuppliedWeiInterest(address accountAddress) external;

    /**
    * @notice Apply the interest accumulated (since last applied) to the borrowed Wei balance of the given account (external)
    * param accountAddress The address of the account to apply interest to
    */
    function applyBorrowedWeiInterest(address accountAddress) external;

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
    * @notice Apply the interest accumulated (since last applied) to the supplied attoDai balance of the given account (external)
    * param accountAddress The address of the account to apply interest to
    */
    function applySuppliedAttoDaiInterest(address accountAddress) external;

    /**
    * @notice Apply the interest accumulated (since last applied) to the borrowed attoDai balance of the given account (external)
    * param accountAddress The address of the account to apply interest to
    */
    function applyBorrowedAttoDaiInterest(address accountAddress) external;

    /**
     * @notice Event emitted when Wei supplied
     */
    event WeiSupplied(address accountAddress, uint256 amount);

    /**
     * @notice Event emitted when Wei withdrawn
     */
    event WeiWithdrawn(address accountAddress, uint256 amount);

    /**
     * @notice Event emitted when Wei borrowed
     */
    event WeiBorrowed(address accountAddress, uint256 amount);

    /**
     * @notice Event emitted when Wei repaid
     */
    event WeiRepaid(address accountAddress, uint256 amount);

    /**
     * @notice Event emitted when supplied Wei interest applied
     */
    event SuppliedWeiInterestApplied(address accountAddress);

    /**
     * @notice Event emitted when borrowed Wei interest applied
     */
    event BorrowedWeiInterestApplied(address accountAddress);

    /**
     * @notice Event emitted when AttoDai supplied
     */
    event AttoDaiSupplied(address accountAddress, uint256 amount);

    /**
     * @notice Event emitted when AttoDai withdrawn
     */
    event AttoDaiWithdrawn(address accountAddress, uint256 amount);

    /**
     * @notice Event emitted when attoDai borrowed
     */
    event AttoDaiBorrowed(address accountAddress, uint256 amount);

    /**
     * @notice Event emitted when attoDai repaid
     */
    event AttoDaiRepaid(address accountAddress, uint256 amount);

    /**
     * @notice Event emitted when supplied attoDai interest applied
     */
    event SuppliedAttoDaiInterestApplied(address accountAddress);

    /**
     * @notice Event emitted when borrowed attoDai interest applied
     */
    event BorrowedAttoDaiInterestApplied(address accountAddress);
}
