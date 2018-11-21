pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./items/Commodity.sol";
import "./interfaces/ICommodity.sol";
import "./interfaces/ICommodities.sol";

/**
 * @title Commodities
 *
 * @notice This contracts holds all data on the commodities
 */
contract Commodities is ICommodities {
  using SafeMath for uint;

  struct CommodityData {
    ICommodity _interface;
    uint miningAmount;
    bytes32 miningTarget;
  }

  // Array storing all info for each commodity
  CommodityData[7] public commodities;

  constructor(address[] _commodityAddresses) public {
    for (uint8 i = 0; i < commodities.length; i++) {
      commodities[i] = CommodityData(
        ICommodity(_commodityAddresses[i]),
        8000,
        bytes32(0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff)
      );
    }
  }

  function getCurrentCargo(address _player) external view returns (uint) {
    uint currentCargo;
    for (uint8 i = 0; i < commodities.length; i++) {
      uint cargoToAdd = commodities[i]._interface.balanceOf(_player);
      currentCargo = currentCargo.add(cargoToAdd);
    }
    return currentCargo;
  }

  function get(uint8 _id) external view returns (
    string name,
    string symbol,
    uint miningAmount,
    bytes32 miningTarget
  ) {
    return (
      commodities[_id]._interface.name(),
      commodities[_id]._interface.symbol(),
      commodities[_id].miningAmount,
      commodities[_id].miningTarget
    );
  }

  function getName(uint8 _id) external view returns (string) {
    return commodities[_id]._interface.name();
  }

  function getSymbol(uint8 _id) external view returns (string) {
    return commodities[_id]._interface.symbol();
  }

  function getMiningAmount(uint8 _id) external view returns (uint) {
    return commodities[_id].miningAmount;
  }

  function getMiningTarget(uint8 _id) external view returns (bytes32) {
    return commodities[_id].miningTarget;
  }

  function getBalance(uint8 _id) external view returns (uint) {
    return commodities[_id]._interface.balanceOf(msg.sender);
  }

  function getInterface(uint8 _id) external view returns (ICommodity) {
    return commodities[_id]._interface;
  }

  function() public {}
}