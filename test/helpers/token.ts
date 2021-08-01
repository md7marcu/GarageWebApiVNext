import { buildUserAccessToken } from "./BuildAccessToken";
import signToken from "./SignToken";

export const buildAndSignToken = (userId, email, claims, scope, key: Buffer): string => {
    let payload = buildUserAccessToken(scope, userId, email, claims);

    return signToken(payload, key);
};