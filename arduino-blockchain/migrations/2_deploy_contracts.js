// migrations/2_deploy_contracts.js
const CropSensor = artifacts.require("CropSensor");

module.exports = function (deployer) {
  deployer.deploy(CropSensor);
};
