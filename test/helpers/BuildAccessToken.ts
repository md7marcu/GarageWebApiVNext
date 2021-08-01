import getRandomString from "./GetRandomString";

export function buildUserAccessToken(scope: string[], userid, email, claims): any {
    let payload = {
        iss: "authorize.ultrakompis.com",
        aud: "api.ultrakompis.com",
        sub: userid,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000) - 30,
        scope: scope,
        email: email,
        claims: claims,
    };

    (payload as any).jti = getRandomString(16);

    return payload;
}