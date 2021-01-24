import { config } from "node-config-ts";
import { Gpio } from "../facades/gpio";
import { GarageDoorStatus } from "../constants/GarageDoorStatus";
import { DoorController } from "./DoorController";
import { GarageDoor } from "../constants/GarageDoor";

interface DoorStates {
    rightState: string;
    leftState: string;
}
export class GarageStateController {
    private gpio: Gpio;
    private doorController: DoorController;

    public constructor(gpio: Gpio) {
        this.gpio = gpio;
        this.doorController = new DoorController(this.gpio);
    }

    public getGarageDoorStatuses(): [string, string] {
        return [
            this.garageDoorStatus(GarageDoor.Left),
            this.garageDoorStatus(GarageDoor.Right),
        ];
    }

    public info(): string {
        return this.gpio.getPiBoardId();
    }

    public OpenRightGarageDoor(): string {
        this.doorController.switchDoor(config.rightPin);

        return "OK";
    }

    public OpenLeftGarageDoor(): string {
        this.doorController.switchDoor(config.leftPin);

        return "OK";
    }

    public CloseRightGarageDoor(): string {
        this.doorController.switchDoor(config.rightPin);

        return "OK";
    }

    public CloseLeftGarageDoor(): string {
        this.doorController.switchDoor(config.leftPin);

        return "OK";
    }

    public SwitchLeftDoor(): string {
        this.doorController.switchDoor(config.leftPin);

        return "OK";
    }

    public SwitchRightDoor(): string {
        this.doorController.switchDoor(config.rightPin);

        return "OK";
    }

    public OpenDoors(): string {
        this.doorController.switchDoor(config.rightPin);
        this.doorController.switchDoor(config.leftPin);

        return "OK";
    }

    public CloseDoors(): string {
        this.doorController.switchDoor(config.rightPin);
        this.doorController.switchDoor(config.leftPin);

        return "OK";
    }

    public garageDoorStatus(door: string): string {
        switch (door) {
            case GarageDoor.Left:
                return this.getState(this.gpio.read(config.leftOpenPin), this.gpio.read(config.leftClosedPin));
            case GarageDoor.Right:
                return this.getState(this.gpio.read(config.rightOpenPin), this.gpio.read(config.rightClosedPin));
            default:
                return GarageDoorStatus.Unknown;
        }
    }

    private getState(open: number, closed: number): string {

        if (open === 1 && closed === 1) {
            return GarageDoorStatus.Open;
        }
        if (open === 1) {
            return GarageDoorStatus.Open;
        }
        if (closed === 1) {
            return GarageDoorStatus.Closed;
        }
        return GarageDoorStatus.Moving;
    }
}
