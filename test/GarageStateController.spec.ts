import "mocha";
import { expect } from "chai";
import { GarageStateController } from "../lib/controllers/GarageStateController";
import { Gpio } from "../lib/facades/gpio";
import { GarageDoor } from "../lib/constants/GarageDoor";

describe("Garage State Routes", () => {
    let gpio: Gpio;

    before( async() => {
        gpio = new Gpio();
    });

    it("Should return moving state for left door", async () => {
        gpio.ready.then( () => {
            let garage = new GarageStateController(gpio);

            let state = garage.garageDoorStatus(GarageDoor.Left);

            expect(state).to.equal("Moving");
        });
    });

    it("Should return moving state for right door", async () => {
        gpio.ready.then( () => {
            let garage = new GarageStateController(gpio);

            let state = garage.garageDoorStatus(GarageDoor.Left);

            expect(state).to.equal("Moving");
        });
    });
});
