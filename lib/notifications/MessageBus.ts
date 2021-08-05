import * as socketio from "socket.io";
import * as http from "http";
import { connect, Client } from "mqtt";
import { config } from "node-config-ts";
import { Gpio } from "../facades/gpio";
import { GarageStateController } from "../controllers/GarageStateController";
import { GarageDoorStatus } from "../constants/GarageDoorStatus";
import { GarageDoor } from "../constants/GarageDoor";
import Debug from "debug";
const debug = Debug("GarageWebApiVNext");

export default class MessageBus {
    private io: any;
    private gpio: Gpio;
    private mqttClient: Client;

    constructor(server: http.Server, gpio: Gpio) {
        this.io = socketio.listen(server);
        this.gpio = gpio;
        this.mqttClient = connect(`mqtt://${config.settings.mqttUser}:${config.settings.mqttPassword}@${config.settings.mqttBroker}`, {});
        this.initBus();
    }

    initBus(): void {
        this.io.on("connect", this.onConnect.bind(this));
        this.io.on("disconnect", this.onDisconnect);
        this.io.on("connection", socket => {
            socket.on("getState", this.getState);
        });
        this.mqttClient.on("connect", () => {
            let states = this.readGarageState();
            debug(`MQTT Client connected: ${JSON.stringify(states)}`);
            this.notifyGarageStates(states);
        });
    }
    public notifyGarage(state: string, door: string): void {
        debug(`MessageBus: Garage ${state}`);
        this.io.sockets.emit("garageState", state);
        this.publishMqtt(state, door);
    }

    public notifyGarageOpened(door: string): void {
        debug("MessageBus: Garage opened");
        this.io.sockets.emit("garageState", GarageDoorStatus.Open);
        this.publishMqtt(GarageDoorStatus.Open, door);
    }

    public notifyGarageClosed(door: string): void {
        debug("MessageBus: Garage Closed");
        this.io.sockets.emit("garageState", GarageDoorStatus.Closed);
        this.publishMqtt(GarageDoorStatus.Closed, door);
    }

    public notifyGarageMoving(door: string): void {
        debug("MessageBus: Garage Moving");
        this.io.sockets.emit("garageState", GarageDoorStatus.Moving);
        this.publishMqtt(GarageDoorStatus.Moving, door);
    }

    public notifyGarageError(door: string): void {
        debug("MessageBus: Garage Error");
        this.io.sockets.emit("garageState", GarageDoorStatus.Error);
        this.publishMqtt(GarageDoorStatus.Error, door);
    }

    private onConnect(socket) {
        socket.emit("garageState", this.readGarageState());
    }

    private onDisconnect() {
        debug("MessageBus: user disconnected");
    }

    private getState = () => {
        debug("MessageBus: GarageState request received");

        return this.notifyGarageStates(this.readGarageState());
    }

    private readGarageState = () => {
        let message = new GarageStateController(this.gpio).getGarageDoorStatuses();
        debug(`MessageBus: GarageState sent: ${message}`);

        return message;
    }

    private notifyGarageStates(states: [string, string]) {
        this.notifyGarage(states[0], GarageDoor.Left);
        this.notifyGarage(states[1], GarageDoor.Right);
    }

    private publishMqtt = (message: string, door: string) => {
        let payload = JSON.stringify({ state: message});
        debug(`Publishing: ${payload}`);
        GarageDoor.Left === door ?
            this.mqttClient.publish(config.settings.mqttLeftTopic, payload[0], { qos: 2}) :
            this.mqttClient.publish(config.settings.mqttRightTopic, payload[1], { qos: 2});
    }
}
