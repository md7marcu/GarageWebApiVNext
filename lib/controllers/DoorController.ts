import { config } from "node-config-ts";
import { Gpio } from "../facades/gpio";
import * as sleep from "system-sleep";
import Debug from "debug";
const debug = Debug("GarageWebApiVNext");

export class DoorController {
    private gpio: Gpio;

    public constructor(gpio: Gpio) {
        this.gpio = gpio;
    }

    public switchDoor(pinNumber: number) {
        this.gpio.setupOutputPin(pinNumber);
        this.gpio.write(pinNumber, 1);
        debug("MoveDoor: Written 1.");
        sleep(config.pinMoveDelay);
        this.gpio.write(pinNumber, 0);
        debug("MoveGate: Written 0.");
    }
}
