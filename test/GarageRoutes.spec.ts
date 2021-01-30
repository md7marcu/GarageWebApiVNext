import "mocha";
import * as Supertest from "supertest";
import * as Debug from "debug";
import * as chai from "chai";
import { expect } from "chai";
import { config } from "node-config-ts";
import { App } from "../lib/app";
import { Gpio } from "../lib/facades/gpio";
import sinon, { stubInterface } from "ts-sinon";

describe("Express routes", () => {
    let gpio: Gpio;
    // tslint:disable-next-line:max-line-length
    let token: string = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhdXRob3JpemUudWx0cmFrb21waXMuY29tIiwiYXVkIjoiYXBpLnVsdHJha29tcGlzLmNvbSIsInN1YiI6InVsdHJha29tcGlzIiwiZXhwIjoxNjExNDE5NzQwLCJpYXQiOjE2MTE0MTYxMTAsInNjb3BlIjpbIm9wZW5pZCIsInNzbiJdLCJlbWFpbCI6ImFAYS5zZSIsImNsYWltcyI6WyJnYXRlIiwiZ2FyYWdlIl19.EdOQhxceEZA_R-ylB16H7QV1zCKdqzocFipzo-HWrZPQtgsE9YTvVhr9IMdy9SHIBeoNg4P0GgYh61MuxOMP-sjtam8wLW_LCnMO8RC3f_n42Lfn2AVwXNTCnCxh18ErR5kxda0j3ta-lr8-rQfYLhvLLvq2bMq1fwvvKRYSI6oegxB1M2-X1wArdujejFWQpd_j1at2F0PgMj3OyGy55V_Fy9-kAMiYDjbo9cwWN47i8Kw1HsCWk89KE3E0p3PZ9WnWstvclUdMt6aLlGvqCwPKqk2fCVUox7pbXMaWdyqerMAJ0KxYf2ltKsoCEPvpgegdud-SFtrCHcTL6tEDcg";
    const sandbox = sinon.createSandbox();
    let app: App;

    before(() => {
        Debug.disable();
        gpio = new Gpio();
        app = new App();
        (app as any).gpio = gpio;
        config.pinMoveDelay = 200;
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
                .setHeader("access_token", "token");
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
