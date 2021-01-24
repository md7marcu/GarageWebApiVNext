import { config } from "node-config-ts";
import { gpio } from "./conditionalGpio";
import { resolve } from "dns";
import Debug from "debug";
const debug = Debug("GateWebApi");

export class Gpio {
    wpi: any;
    windowsFacade: any;
    public ready: Promise<any>;

    public constructor(){

        if (process.env.NODE_ENV === "windows" || process.env.NODE_ENV === "test"){ // fake when windows
            debug("Running on windows or test. Setting up fake wiringpi");
            this.ready = new Promise((promiseResolve) => {
                this.wpi = gpio as any;
                this.wpi.setup(config.defaultWiringPiMode);
                promiseResolve(this.wpi);
            });
        } else { // Dynamically import node-wiring-pi
            this.ready = new Promise((promiseResolve) => {
                debug("Running on hardware with GPIO. Setting up wiringpi");
                // @ts-ignore - Ignore if the package is not found (windows). Always verified
                import(gpio).then(result => {
                    this.wpi = result;
                    this.wpi.setup(config.defaultWiringPiMode);
                    promiseResolve(this.wpi);
                });
            })
        }
    }

    public getPiBoardId(): string {
        return this.wpi.piBoardId();
    }

    public setupOutputPin(pin: number): void {
        this.wpi.pinMode(pin, this.wpi.OUTPUT);
    }

    public write(pin: number, value: number): void {
        this.wpi.digitalWrite(pin, value);
    }

    public read(pin: number): number {
        return this.wpi.digitalRead(pin);
    }

    public setPullUp(pin: number): void {
        this.wpi.pullUpDnControl(pin, this.wpi.PUD_UP);
    }

    public setPullDown(pin: number): void {
        this.wpi.pullUpDnControl(pin, this.wpi.PUD_DOWN);
    }

    public setupInput(pin: number): void {
        this.wpi.pinMode(pin, this.wpi.INPUT);
    }

    public setFallingInterrupt(pin: number, callback: (delta: number) => any)
        : void {
        this.wpi.wiringPiISR(pin, this.wpi.INT_EDGE_FALLING, callback); 
    }

    public setRisingInterrupt(pin: number, callback: (delta: number) => any)
    : void {
        this.wpi.wiringPiISR(pin, this.wpi.INT_EDGE_RISING, callback);
    }
}
