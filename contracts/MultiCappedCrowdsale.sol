pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';

/**
 * @title MultiCappedCrowdsale
 * @dev Extension of Crowsdale with a soft cap and a hard cap.
 * after finishing. By default, it will end token minting.
 */
contract MultiCappedCrowdsale is Crowdsale, Ownable {
  using SafeMath for uint256;

  uint256 public softCap;
  uint256 public hardCap = 0;
  bytes32 public hardCapHash;
  uint256 public hardCapBlock = 0;
  uint256 public constant endBuffer = 70;
  event NotFinalized(bytes32 _a, bytes32 _b);

  function MultiCappedCrowdsale(uint256 _softCap, bytes32 _hardCapHash) {
    require(_softCap > 0);
    softCap = _softCap;
    hardCapHash = _hardCapHash;
  }

  //
  //  Soft cap logic
  //
  
  // overriding Crowdsale#validPurchase to add extra cap logic
  // @return true if investors can buy at the moment
  function validPurchase() internal constant returns (bool) {
    if (hardCap > 0) {
      checkHardCap(weiRaised.add(msg.value));
    }
    return super.validPurchase();
  }

  //
  //  Hard cap logic
  //

  // should be called after crowdsale ends, to do
  // some extra finalization work
  function bytes32ToString (bytes32 data) private returns (string) {
    bytes memory bytesString = new bytes(32);
    for (uint j=0; j<32; j++) {
        byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
        if (char != 0) {
            bytesString[j] = char;
        }
    }
    return string(bytesString);
  }

  function hashHardCap(uint256 _hardCap) internal constant returns (bytes32) {
    return sha256(bytes32ToString(bytes32(_hardCap)));
  }

  function setHardCap(uint256 _hardCap) external onlyOwner {
    if (hardCapHash != hashHardCap(_hardCap)) {
      NotFinalized(hashHardCap(_hardCap), hardCapHash);
      return;
    }
    hardCap = _hardCap;
    checkHardCap(weiRaised);
  }

  function checkHardCap(uint256 totalRaised) internal {
    if (hardCapBlock == 0 && totalRaised > hardCap) {
      hardCapBlock = block.number;
      endBlock = block.number+endBuffer;
    }
  }

}
