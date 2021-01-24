/* tslint:disable */
interface Config {
  defaultWiringPiMode: string;
  client: string;
  mac: string;
  mqttLeftTopic: string;
  mqttRightTopic: string;
  mqttBroker: string;
  mqttPassword: string;
  mqttUser: string;
  issuer: string;
  audience: string;
  serverCert: string;
  algorithm: string;
  gateClaim: string;
  leftPin: number;
  rightPin: number;
  leftOpenPin: number;
  leftClosedPin: number;
  rightOpenPin: number;
  rightClosedPin: number;
  garageClaim: string;
  pinMoveDelay: number;
}