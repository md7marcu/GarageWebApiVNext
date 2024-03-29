import * as express from "express";
import * as bodyParser from "body-parser";
import { Gpio } from "./facades/gpio";
import * as https from "https";
import Debug from "debug";
import { GarageRoutes } from "./routes/GarageRoutes";
import { DebugRoutes } from "./routes/DebugRoutes";
import MessageBus from "./notifications/MessageBus";
import * as fs from "fs";
import { config } from "node-config-ts";

const debug = Debug("GarageWebApiVNext");

const httpsOptions = {
    key: fs.readFileSync("./" + config.settings.appKey),
    cert: fs.readFileSync("./" + config.settings.appCert),
 };
export class App {
    public server: https.Server;
    private app: express.Application;
    private garageRoute: GarageRoutes = new GarageRoutes();
    private debugRoutes: DebugRoutes = new DebugRoutes();
    private messageBus: MessageBus;
    private gpio: Gpio;

    constructor() {
        debug("Constructing app.");
        this.app = express();
        this.server = https.createServer(httpsOptions, this.app);
        this.config();
        this.gpio = new Gpio();
        this.gpio.ready.then(() => {
            debug("Gpio ready.");
            this.messageBus = new MessageBus(this.server, this.gpio);
            this.garageRoute.routes(this.app, this.gpio);

            if (process.env.NODE_ENV === "test") {
                this.debugRoutes.routes(this.app, this.gpio, this.messageBus);
            }
        });
    }

    private config(): void {
        // support application/json type post data
        this.app.use(bodyParser.json());
        // support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(express.static("public"));
    }
}

export default new App().server;
