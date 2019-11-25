const Web3 = require("web3");

// import contract
var HeavenTicket = artifacts.require("HeavenTicket");

// truffle deploy
module.exports = function(deployer) {
  // params passed to __ ctor. token values in ether
  deployer.deploy(HeavenTicket, 'HeavenTicket', 'HT', 0, 21000000, Web3.utils.toWei("1"));
};