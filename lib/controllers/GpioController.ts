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
        this.gpio.setupOutputPin(config.settings.leftPin);
        let value = this.gpio.read(config.settings.leftPin);
        debug(`Left garage door: ${value}`);

        this.gpio.setupOutputPin(config.settings.rightPin);
        value = this.gpio.read(config.settings.rightPin);
        debug(`Right garage door: ${value}`);
    }

    public setupLeftGarageSensors(): void {
        this.gpio.setupInput(config.settings.leftOpenPin);
        this.gpio.setPullDown(config.settings.leftOpenPin);
        this.gpio.setupInput(config.settings.leftClosedPin);
        this.gpio.setPullDown(config.settings.leftClosedPin);
        let open = this.gpio.read(config.settings.leftOpenPin);
        let closed = this.gpio.read(config.settings.leftClosedPin);
        debug(`Left open/closed: ${open}/${closed}`);
    }

    public setupRightGarageSensors(): void {
        this.gpio.setupInput(config.settings.rightOpenPin);
        this.gpio.setPullDown(config.settings.rightOpenPin);
        this.gpio.setupInput(config.settings.rightClosedPin);
        this.gpio.setPullDown(config.settings.rightClosedPin);
        let open = this.gpio.read(config.settings.rightOpenPin);
        let closed = this.gpio.read(config.settings.rightClosedPin);
        debug(`Right open/closed: ${open}/${closed}`);
    }

    private start(): void {
        this.setupLeftGarageSensors();
        this.setupRightGarageSensors();
        this.setupGarage();

        this.gpio.setRisingInterrupt(config.settings.leftOpenPin, (delta) => {
                // Triggered when it comes back high again
                this.bus.notifyGarageOpened(GarageDoor.Left);
                // Push notification
                this.notify(`Pin ${config.settings.leftOpenPin} changed to HIGH ${delta}`);
        });

        this.gpio.setFallingInterrupt(config.settings.leftOpenPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageMoving(GarageDoor.Left);
            // Push notification
            this.notify(`Pin ${config.settings.leftOpenPin} changed to LOW ${delta}`);
        });

        this.gpio.setRisingInterrupt(config.settings.leftClosedPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageClosed(GarageDoor.Left);
            // Push notification
            this.notify(`Pin ${config.settings.leftClosedPin} changed to HIGH ${delta}`);
        });

        this.gpio.setFallingInterrupt(config.settings.leftClosedPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageMoving(GarageDoor.Left);
            // Push notification
            this.notify(`Pin ${config.settings.leftClosedPin} changed to LOW ${delta}`);
        });
        // -------- Right ------------
        this.gpio.setRisingInterrupt(config.settings.rightOpenPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageOpened(GarageDoor.Right);
            // Push notification
            this.notify(`Pin ${config.settings.rightOpenPin} changed to HIGH ${delta}`);
        });

        this.gpio.setFallingInterrupt(config.settings.rightOpenPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageMoving(GarageDoor.Right);
            // Push notification
            this.notify(`Pin ${config.settings.rightOpenPin} changed to LOW ${delta}`);
        });

        this.gpio.setRisingInterrupt(config.settings.rightClosedPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageClosed(GarageDoor.Right);
            // Push notification
            this.notify(`Pin ${config.settings.rightClosedPin} changed to HIGH ${delta}`);
        });

        this.gpio.setFallingInterrupt(config.settings.rightClosedPin, (delta) => {
            // Triggered when it comes back high again
            this.bus.notifyGarageMoving(GarageDoor.Right);
             // Push notification
             this.notify(`Pin ${config.settings.rightClosedPin} changed to LOW ${delta}`);
        });
    }
    private notify(message: string): void {
        debug(`Notify: ${message}`);
    }
}
