pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';

/**
 * @title FinalizableCrowdsale
 * @dev Extension of Crowsdale where an owner can do extra work
 * after finishing. By default, it will end token minting.
 */
contract MyFinalizableCrowdsale is Crowdsale, Ownable {
  using SafeMath for uint256;

  bool public isFinalized = false;

  // address where funds are collected
  address public tokenWallet;

  event Finalized();
  event FinalTokens(uint256 _generated);

  function MyFinalizableCrowdsale(address _tokenWallet) {
    tokenWallet = _tokenWallet;
  }


  function finalize() onlyOwner {
    require(!isFinalized);
    require(hasEnded());

    finalization();
    Finalized();
    
    isFinalized = true;
  }

  function generateFinalTokens(uint256 ratio) internal {
    uint256 finalValue = token.totalSupply();
    finalValue = finalValue.mul(ratio).div(100);

    token.mint(tokenWallet, finalValue);
    FinalTokens(finalValue);
  }

  // end token minting on finalization
  // override this with custom logic if needed
  function finalization() internal {
    token.finishMinting();
  }



}
