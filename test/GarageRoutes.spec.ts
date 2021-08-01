import "mocha";
import * as Supertest from "supertest";
import * as Debug from "debug";
import { expect } from "chai";
import { config } from "node-config-ts";
import { App } from "../lib/app";
import { Gpio } from "../lib/facades/gpio";
import sinon from "ts-sinon";
import setHttpsOptions from "./helpers/certs";
import { buildAndSignToken } from "./helpers/token";

describe("Garage Routes", () => {
    let gpio: Gpio;
    // tslint:disable-next-line:max-line-length
    let token: string;
    const sandbox = sinon.createSandbox();
    let app: App;

    before(() => {
        Debug.disable();
        gpio = new Gpio();
        app = new App();
        (app as any).gpio = gpio;
        config.pinMoveDelay = 20;
        setHttpsOptions(app);
        config.serverCert = "/config/tests/testcert.pem",
        token = buildAndSignToken("1234", "emailjuarez@email.com", config.garageClaim, undefined, (app as any).httpsOptions.key);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("Should return 200 on alive endpoint", async () => {
        const response = await Supertest(app.server).get("/alive");

        expect(response.status).to.be.equal(200);
    });

    it("Should return 401 on GetGarageDoorStatus endpoint when called without token", async () => {
        gpio.ready.then(async () => {
            const response = await Supertest(app.server)
                .get("/GetGarageDoorStatuses")
                .set("access_token", "token");
            expect(response.status).to.be.equal(401);
        });
    });

    it("Should open the right garage door on OpenRightGarageDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/OpenRightGarageDoor")
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });
    
    it("Should close the right garage door on OpenRightGarageDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/CloseRightGarageDoor")
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });

    it("Should open the left garage door on OpenLeftGarageDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/OpenLeftGarageDoor")
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });

    it("Should close the left garage door on CloseLeftGarageDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/CloseLeftGarageDoor")
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });

    it("Should move the left garage door on SwitchLeftDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/SwitchLeftDoor")
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });

    it("Should move the right garage door on SwitchRightDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/SwitchRightDoor")
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });

    it("Should open the doors on OpenDoors call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/OpenDoors")
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.callCount(spy, 4);
        expect(response.status).to.be.equal(200);
    });

    it("Should close the doors on CloseDoors call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/CloseDoors")
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.callCount(spy, 4);
        expect(response.status).to.be.equal(200);
    });
});
