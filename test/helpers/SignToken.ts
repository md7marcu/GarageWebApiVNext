import { sign } from "jsonwebtoken";

export default function signToken(options: any, key: Buffer): string {
        return sign(options, key, { algorithm: "RS256" });
}
