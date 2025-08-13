
pragma solidity ^0.8.0;

contract CropSensor {
    address public owner;
    int public temperature;
    int public humidity;
    bool public claimTriggered;

    event SensorDataUpdated(int temperature, int humidity);
    event InsuranceClaimTriggered(address indexed farmer);

    constructor() {
        owner = msg.sender;
    }

    function updateSensorData(int _temperature, int _humidity) public {
        temperature = _temperature;
        humidity = _humidity;

        emit SensorDataUpdated(_temperature, _humidity);

        // Dummy insurance logic: trigger claim if temp > 45°C or humidity < 20%
        if ((_temperature > 45 || _humidity < 20) && !claimTriggered) {
            triggerInsuranceClaim(msg.sender);
        }
    }

    function triggerInsuranceClaim(address farmer) internal {
        claimTriggered = true;
        emit InsuranceClaimTriggered(farmer);
    }
}
