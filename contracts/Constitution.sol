
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Constitution {
    string private _ipfsHash;
    uint256 private _nftSupply;
    address private _nftContractAddress;

    address[] private _voters;
    mapping(address => string) private _votes;

    uint256 private constant FIRST_NFT_ID = 7;
    uint256 private constant FOUNDING_NFT_ID = 69;
    uint256 private constant CITIZEN_NFT_ID = 42;

    function getConstitution() public view returns (string memory) {
        return _ipfsHash;
    }

    function getVote() public view returns (string memory) {
        return _votes[msg.sender];
    }

    function voteFor(string memory ipfsHash) public {
        if (!_arrayIncludes(_voters, msg.sender)) {
            _voters.push(msg.sender);
        }
        _votes[msg.sender] = ipfsHash;
    }

    function amend(string memory ipfsHash) public {
        address[] memory matchingVoters = _getAddressesVotingFor(ipfsHash);
        uint256 nftCount = _getNftCount(matchingVoters);
        require(nftCount > _nftSupply / 2, "Not enough votes");

        _ipfsHash = ipfsHash;
    }

    function _getAddressesVotingFor(string memory ipfsHahs) private returns (address[] memory) {
        bool[] memory matching = new bool[](_voters.length);
        uint256 matchingCount = 0;

        for (uint256 i = 0; i < _voters.length; i++) {
            address addr = _voters[i];
            if (keccak256(bytes(_votes[addr])) == keccak256(bytes(ipfsHahs))) {
                matching[i] = true;
                matchingCount = matchingCount + 1;
            }
        }

        address[] memory matchingVoters = new address[](matchingCount);
        uint256 j = 0;
        for (uint256 i = 0; i < _voters.length; i++) {
            if (matching[i]) {
                matchingVoters[j] = _voters[i];
                j = j + 1;
            }
        }

        return matchingVoters;
    }

    function _getNftCount(address[] memory addresses) private returns (uint256) {
        IERC1155 nftContract = IERC1155(_nftContractAddress);

        uint256[] memory first = nftContract.balanceOfBatch(addresses, _getUint256Range(addresses.length, FIRST_NFT_ID));
        uint256[] memory founding = nftContract.balanceOfBatch(addresses, _getUint256Range(addresses.length, FOUNDING_NFT_ID));
        uint256[] memory citizen = nftContract.balanceOfBatch(addresses, _getUint256Range(addresses.length, CITIZEN_NFT_ID));

        uint256 count = 0;
        for (uint256 i = 0; i < addresses.length; i++) {
            count += first[i] + founding[i] + citizen[i];
        }

        return count;
    }

    function _getUint256Range(uint256 length, uint256 value) private pure returns (uint256[] memory result) {
        uint256[] memory range = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            range[i] = value;
        }
        return range;
    }

    function _arrayIncludes(address[] memory addresses, address addr) private pure returns (bool) {
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] == addr) {
                return true;
            }
        }
        return false;
    }

    constructor(address nftContractAddress, uint256 nftSupply) {
        _nftContractAddress = nftContractAddress;
        _nftSupply = nftSupply;
    }
}

