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
        config.settings.pinMoveDelay = 20;
        setHttpsOptions(app);
        config.settings.serverCert = "/config/tests/testcert.pem",
        token = buildAndSignToken("1234", "emailjuarez@email.com", config.settings.garageClaim, undefined, (app as any).httpsOptions.key);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("Should return 200 on alive endpoint", async () => {
        const response = await Supertest(app.server)
        .get("/alive")
        .trustLocalhost();

        expect(response.status).to.be.equal(200);
    });

    it("Should return 401 on GetGarageDoorStatus endpoint when called without token", async () => {
        gpio.ready.then(async () => {
            const response = await Supertest(app.server)
                .get("/GetGarageDoorStatuses")
                .trustLocalhost()
                .set("access_token", "token");
            expect(response.status).to.be.equal(401);
        });
    });

    it("Should open the right garage door on OpenRightGarageDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/OpenRightGarageDoor")
        .trustLocalhost()
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });
    
    it("Should close the right garage door on OpenRightGarageDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/CloseRightGarageDoor")
        .trustLocalhost()
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });

    it("Should open the left garage door on OpenLeftGarageDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/OpenLeftGarageDoor")
        .trustLocalhost()
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });

    it("Should close the left garage door on CloseLeftGarageDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/CloseLeftGarageDoor")
        .trustLocalhost()
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });

    it("Should move the left garage door on SwitchLeftDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/SwitchLeftDoor")
        .trustLocalhost()
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });

    it("Should move the right garage door on SwitchRightDoor call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/SwitchRightDoor")
        .trustLocalhost()
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.calledTwice(spy);
        expect(response.status).to.be.equal(200);
    });

    it("Should open the doors on OpenDoors call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/OpenDoors")
        .trustLocalhost()
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.callCount(spy, 4);
        expect(response.status).to.be.equal(200);
    });

    it("Should close the doors on CloseDoors call", async () => {
        let spy = sandbox.spy(gpio, "write");

        const response = await Supertest(app.server)
        .post("/CloseDoors")
        .trustLocalhost()
        .set("Authorization", `Bearer ${token}`);

        sandbox.assert.callCount(spy, 4);
        expect(response.status).to.be.equal(200);
    });
});
