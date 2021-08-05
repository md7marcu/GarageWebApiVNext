/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    settings: Settings
  }
  interface Settings {
    defaultWiringPiMode: string
    client: string
    mac: string
    mqttLeftTopic: string
    mqttRightTopic: string
    mqttBroker: string
    mqttPassword: string
    mqttUser: string
    issuer: string
    audience: string
    serverCert: string
    appCert: string
    appKey: string
    algorithm: string
    gateClaim: string
    leftPin: number
    rightPin: number
    leftOpenPin: number
    leftClosedPin: number
    rightOpenPin: number
    rightClosedPin: number
    garageClaim: string
    pinMoveDelay: number
    ignoreTokenExpiration: boolean
    ignoreTokenCreation: boolean
  }
  export const config: Config
  export type Config = IConfig
}
