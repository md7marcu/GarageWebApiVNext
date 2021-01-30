import { Request, Response, NextFunction, Application } from "express";
import { config } from "node-config-ts";
import * as Fs from "fs";
import { VerifyOptions, verify } from "jsonwebtoken";
import { pki }from "node-forge";
import * as Debug from "debug";
import { includes } from "lodash";
import * as path from "path";
import { GarageStateController } from "../controllers/GarageStateController";
import { Gpio } from "facades/gpio";

const debug = Debug("GarageWebApiVNext");

export interface IRequest extends Request {
    access_token: string;
}

export class GarageRoutes {
    private AUTH_HEADER = "authorization";

    public routes(app: Application, gpio: Gpio): void {
        let garageController: GarageStateController = new GarageStateController(gpio);

        app.get("/alive", async(req: IRequest, res: Response) => {
            res.send("Success!");
        });

        app.get("/info", this.retrieveAccessToken, this.requireAccessToken, async(req: IRequest, res: Response, next: NextFunction) => {
            debug("info endpoint called.");

            // tslint:disable-next-line:whitespace
            if (this.userAuthorized(req)) {
                let message =  garageController.info();
                res.status(200).send({
                    message: message,
                });
            } else {
                res.status(403).send("Unknown Scope.");
                next("Forbidden");
            }
            next();
        });

        // naming from c#
        app.get("/GetGarageDoorStatuses", this.retrieveAccessToken, this.requireAccessToken,
                 async(req: IRequest, res: Response, next: NextFunction) => {
            debug("GetGarageDoorStatuses endpoint called.");

            // tslint:disable-next-line:whitespace
            if (this.userAuthorized(req)) {
                let statuses = garageController.getGarageDoorStatuses();
                res.send(statuses);
            } else {
                res.status(403).send("Unknown Scope.");
                next("Forbidden");
            }
            next();
        });

        app.post("/OpenRightGarageDoor", this.retrieveAccessToken, this.requireAccessToken,
                 async(req: IRequest, res: Response, next: NextFunction) => {
            debug("OpenRightGarageDoor endpoint called.");

            // tslint:disable-next-line:whitespace
            if (this.userAuthorized(req)) {
                let status = garageController.OpenRightGarageDoor();
                res.send(status);
            } else {
                res.status(403).send("Unknown Scope.");
                next("Forbidden");
            }
            next();
        });

        app.post("/CloseRightGarageDoor", this.retrieveAccessToken, this.requireAccessToken,
                 async(req: IRequest, res: Response, next: NextFunction) => {
            debug("CloseRightGarageDoor endpoint called.");

            // tslint:disable-next-line:whitespace
            if (this.userAuthorized(req)) {
                let status = garageController.CloseRightGarageDoor();
                res.send(status);
            } else {
                res.status(403).send("Unknown Scope.");
                next("Forbidden");
            }
            next();
        });

        app.post("/OpenLeftGarageDoor", this.retrieveAccessToken, this.requireAccessToken,
                 async(req: IRequest, res: Response, next: NextFunction) => {
            debug("OpenLeftGarageDoor endpoint called.");

            // tslint:disable-next-line:whitespace
            if (this.userAuthorized(req)) {
                let status = garageController.OpenLeftGarageDoor();
                res.send(status);
            } else {
                res.status(403).send("Unknown Scope.");
                next("Forbidden");
            }
            next();
        });

        app.post("/CloseLeftGarageDoor", this.retrieveAccessToken, this.requireAccessToken,
                 async(req: IRequest, res: Response, next: NextFunction) => {
            debug("CloseLeftGarageDoor endpoint called.");

            // tslint:disable-next-line:whitespace
            if (this.userAuthorized(req)) {
                let status = garageController.CloseLeftGarageDoor();
                res.send(status);
            } else {
                res.status(403).send("Unknown Scope.");
                next("Forbidden");
            }
            next();
        });

        app.post("/SwitchRightDoor", this.retrieveAccessToken, this.requireAccessToken,
                 async(req: IRequest, res: Response, next: NextFunction) => {
            debug("SwitchRightDoor endpoint called.");

            if (this.userAuthorized(req)) {
                let status = garageController.SwitchRightDoor();
                res.send(status);
            } else {
                res.status(403).send("Unknown Scope.");
                next("Forbidden");
            }
            next();
        });

        app.post("/SwitchLeftDoor", this.retrieveAccessToken, this.requireAccessToken, async(req: IRequest, res: Response, next: NextFunction) => {
            debug("SwitchLeftDoor endpoint called.");

            if (this.userAuthorized(req)) {
                let status = garageController.SwitchLeftDoor();
                res.send(status);
            } else {
                res.status(403).send("Unknown Scope.");
                next("Forbidden");
            }
            next();
        });

        app.post("/CloseDoors", this.retrieveAccessToken, this.requireAccessToken, async(req: IRequest, res: Response, next: NextFunction) => {
            debug("CloseDoors endpoint called.");

            if (this.userAuthorized(req)) {
                let status = garageController.CloseDoors();
                res.send(status);
            } else {
                res.status(403).send("Unknown Scope.");
                next("Forbidden");
            }
            next();
        });

        app.post("/OpenDoors", this.retrieveAccessToken, this.requireAccessToken, async(req: IRequest, res: Response, next: NextFunction) => {
            debug("OpenDoors endpoint called.");

            if (this.userAuthorized(req)) {
                let status = garageController.OpenDoors();
                res.send(status);
            } else {
                res.status(403).send("Unknown Scope.");
                next("Forbidden");
            }
            next();
        });
    }

    private userAuthorized = (req: IRequest) => {
        return req && req.access_token && includes((req.access_token as any).claims, config.garageClaim);
    }

    private retrieveAccessToken = (req: IRequest, res: Response, next: NextFunction) => {
        // get the auth servers public key
        let serverCert = Fs.readFileSync(path.join(process.cwd(), config.serverCert)).toString();
        let publicKey = pki.publicKeyToPem(pki.certificateFromPem(serverCert).publicKey);
        let accessToken = this.getAccessToken(req);

        debug(`Server public key: ${JSON.stringify(publicKey)}`);

        // Verify access token
        let decodedToken;
        try {
            let options = this.getVerifyOptions();
            decodedToken = verify(accessToken, publicKey, options);
        } catch (err) {
            debug(`Verifying accessToken failed: ${err.message}`);
            res.status(401).send(JSON.stringify(err));
            // tslint:disable-next-line:whitespace
            next(err.message);
        }

        if (decodedToken) {
            debug(`AccessToken signature valid. ${decodedToken}`);
            req.access_token = decodedToken;
        }
        next();
    }

    // If access_token doesn't exist on request, we couldn't verify it => return Unauthorized
    private requireAccessToken = (req: IRequest, res: Response, next: NextFunction) => {

        if (!req.access_token) {
            res.status(401).send();
            next("Unauthorized");
        }
        next();
    }

    // Get the access token from the request
    // It should be in the header (bearer: "....")
    // It might be in the body or in the query
    // It shouldn't be, but it might
    private getAccessToken = (req: Request): string => {
        let authHeader = req.headers[this.AUTH_HEADER];
        let token: string = "";

        if (authHeader && authHeader.toString().toLowerCase().indexOf("bearer") === 0) {
            debug(`Found token in header.`);
            token = authHeader.slice("bearer ".length).toString();
        } else if (req.body && req.body.access_token) {
            debug(`Found token in body.`);
            token = req.body.access_token.toString();
        } else if (req.query && req.query.access_token) {
            debug(`Found token in header.`);
            token = req.query.access_token.toString();
        }
        debug(`Token: ${token}`);

        return token;
    }

    // Decide what to verify in the token
    private getVerifyOptions = () => {
        let verifyOptions: VerifyOptions = {};

        verifyOptions.issuer = config.issuer;
        verifyOptions.audience = config.audience;
        verifyOptions.ignoreNotBefore = config.ignoreTokenExpiration;
        verifyOptions.ignoreExpiration = config.ignoreTokenCreation;
        verifyOptions.algorithms = [config.algorithm];

        return verifyOptions;
    }
}