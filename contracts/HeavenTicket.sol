pragma solidity ^0.5.11;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract HeavenTicket is Ownable, ERC20, ERC20Detailed
{

    // The using A for B; directive is active for the current scope which is limited to a contract
    // AKA use the library here
    using SafeMath for uint256;

    // state int
    uint256 ticketPrice;

    // Define simple type of the users address
    struct Guest {
        address guestAddress;
        uint guestId;
    }

    // array of guests that have paid for ticket
    address[] public guests;

    // could get away with a simple address[] in state like ^^ but then you
    // would need to iterate every time to search the arr use mapping as look up table
    // mapping (address => bool) public guestList;

    mapping(address => Guest) public guestList;

    address[] public patrons;
    // array of guests that are currently in heaven
    mapping (address => Guest) public heavenList;

    // fired when guest buys ticket
    event TicketBought(address guest);

    // fired when guest enters heaven
    event EnteredHeaven(address guest);

    // fired when guest leaves heaven
    event LeftHeaven(address guest);

    // Pass ctor params for contract params @SEE migrations/2_deploy_contracts
    constructor
    (
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initalSupply,
        uint256 _ticketPrice
    )
    ERC20Detailed(_name, _symbol, _decimals) // call ERC20Detailed ctor
    public
    {
        // dont go further unless there is some tickets
        require(_initalSupply > 0, "﴾͡๏̯͡๏﴿ O'RLY?");

        // calc total supply
        uint256 totalSupply_ = _initalSupply;

        // ticket price
        ticketPrice = _ticketPrice;

        // mint inital supply for contract owner
        _mint(msg.sender, totalSupply_);
    }

    function () external payable {
        buyTicket();
    }

    // allow sender to buy ticket if they pay enough, and haven't already bought
    function buyTicket() public payable
    {
        address _senderAddress = _msgSender();
        require(!isOwner(), "sender can't be contract owner"); // should still be same logic as bellow
        require(msg.value == 1 ether, "you need money to get into heaven");
        require(!isGuestOnList(_senderAddress), "you can only go to heaven once");
        require(!isPatron(_senderAddress), "you can't buy ticket when in heaven");

        // add user to list
        guestList[_senderAddress].guestId = guests.push(_senderAddress) - 1;

        // mint 1 token for the sender
        _mint(_senderAddress, 1);

        emit TicketBought(_senderAddress);
    }

    function getTicketPrice() public view returns(uint256)
    {
        return ticketPrice;
    }

    /**
     *  @dev User can enter heavenList, only if they have a ticket in the guest list
     * User must be in guestList map
     * User must be removed from guests arr
     * user must burn their ticket to enter
     * must account number of patrons in heaven
     */
    function enterHeaven(address _senderAddress) public payable returns(bool)
    {
        require(isGuestOnList(_senderAddress), "heavens pretty exclusive, buy a ticket");

        uint rowToDelete = guestList[_senderAddress].guestId;
        address keyToMove = guests[guests.length-1];
        guests[rowToDelete] = keyToMove;
        guestList[keyToMove].guestId = rowToDelete;
        guests.length--;

        heavenList[_senderAddress].guestId = patrons.push(_senderAddress) - 1;

        // mint 1 token for the sender
        _burn(_senderAddress, 1);

        emit EnteredHeaven(_senderAddress);
        return true;
    }

    function leaveHeaven(address _senderAddress) public payable returns(bool)
    {
        require(isPatron(_senderAddress), "can only leave if your in");

        uint rowToDelete = heavenList[_senderAddress].guestId;
        address keyToMove = patrons[patrons.length-1];
        patrons[rowToDelete] = keyToMove;
        heavenList[keyToMove].guestId = rowToDelete;
        patrons.length--;

        emit LeftHeaven(_senderAddress);
        return true;
    }

    // Is address in state array
    function isGuestOnList(address _guestAddress) public view returns(bool isFoSho)
    {
        if(guests.length == 0)
        {
            return false;
        }
        return (guests[guestList[_guestAddress].guestId] == _guestAddress);
    }

    function getGuestCount() public view returns(uint256)
    {
        return guests.length;
    }

    function isPatron(address _guestAddress) public view returns(bool isFoSho)
    {
        if(patrons.length == 0)
        {
            return false;
        }
        return (patrons[heavenList[_guestAddress].guestId] == _guestAddress);
    }

    function getPatronCount() public view returns(uint256)
    {
        return patrons.length;
    }

    // provide a way of destorying the contract to only the owner
    function kill() external {
        require(isOwner(), "Only the owner can kill this contract");
        selfdestruct(address(uint160(msg.sender)));
    }
}