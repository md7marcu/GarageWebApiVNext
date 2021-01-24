import { config } from "node-config-ts";
import MessageBus from "../notifications/MessageBus";
import { Gpio } from "../facades/gpio";
import Debug from "debug";
import { GarageDoor } from "constants/GarageDoor";
const debug = Debug("GarageWebApiVNext");

export class GpioController {
    private gpio: Gpio;
    private bus: MessageBus;

    public constructor(bus: MessageBus, gpio: Gpio) {
        this.bus = bus;
        this.gpio = gpio;
        this.start();
    }
    
    public setupGarage(): void {
        this.gpio.setupOutputPin(config.leftPin);
        let value = this.gpio.read(config.leftPin);
        debug(`Left garage door: ${value}`);

        this.gpio.setupOutputPin(config.rightPin);
        value = this.gpio.read(config.rightPin);
        debug(`Right garage door: ${value}`);
    }

    public setupLeftGarageSensors(): void {
        this.gpio.setupInput(config.leftOpenPin);
        this.gpio.setPullDown(config.leftOpenPin);
        this.gpio.setupInput(config.leftClosedPin);
        this.gpio.setPullDown(config.leftClosedPin);
        let open = this.gpio.read(config.leftOpenPin);
        let closed = this.gpio.read(config.leftClosedPin);
        debug(`Left open/closed: ${open}/${closed}`);
    }

    public setupRightGarageSensors(): void {
        this.gpio.setupInput(config.rightOpenPin);
        this.gpio.setPullDown(config.rightOpenPin);
        this.gpio.setupInput(config.rightClosedPin);
        this.gpio.setPullDown(config.rightClosedPin);
        let open = this.gpio.read(config.rightOpenPin);
        let closed = this.gpio.read(config.rightClosedPin);
        debug(`Right open/closed: ${open}/${closed}`);
    }

    private start(): void {
        this.setupLeftGarageSensors();
        this.setupRightGarageSensors();
        this.setupGarage();

        this.gpio.setRisingInterrupt(config.leftOpenPin, (delta) => {
                // Triggered when it comes back high again
                this.bus.notifyGarageOpened(GarageDoor.Left);
                // Push notification
                this.notify(`Pin ${config.leftOpenPin} changed to HIGH ${delta}`);
        });

        this.gpio.setFallingInterrupt(config.leftOpenPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageMoving(GarageDoor.Left);
            // Push notification
            this.notify(`Pin ${config.leftOpenPin} changed to LOW ${delta}`);
        });

        this.gpio.setRisingInterrupt(config.leftClosedPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageClosed(GarageDoor.Left);
            // Push notification
            this.notify(`Pin ${config.leftClosedPin} changed to HIGH ${delta}`);
        });

        this.gpio.setFallingInterrupt(config.leftClosedPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageMoving(GarageDoor.Left);
            // Push notification
            this.notify(`Pin ${config.leftClosedPin} changed to LOW ${delta}`);
        });
        // -------- Right ------------
        this.gpio.setRisingInterrupt(config.rightOpenPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageOpened(GarageDoor.Right);
            // Push notification
            this.notify(`Pin ${config.rightOpenPin} changed to HIGH ${delta}`);
        });

        this.gpio.setFallingInterrupt(config.rightOpenPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageMoving(GarageDoor.Right);
            // Push notification
            this.notify(`Pin ${config.rightOpenPin} changed to LOW ${delta}`);
        });

        this.gpio.setRisingInterrupt(config.rightClosedPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageClosed(GarageDoor.Right);
            // Push notification
            this.notify(`Pin ${config.rightClosedPin} changed to HIGH ${delta}`);
        });

        this.gpio.setFallingInterrupt(config.rightClosedPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageMoving(GarageDoor.Right);
             // Push notification
             this.notify(`Pin ${config.rightClosedPin} changed to LOW ${delta}`);
        });
    }
    private notify(message: string): void {
        debug(`Notify: ${message}`);
    }
}
