// import migration contract
const Migrations = artifacts.require("Migrations");

// deploy
module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
