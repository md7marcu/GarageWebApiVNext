import * as fs from "fs";

export const setHttpsOptions = (lapp) => {
    lapp.httpsOptions = {
        key: fs.readFileSync("./config/tests/testkey.pem"),
        cert: fs.readFileSync("./config/tests/testcert.pem"),
    };
};
export default setHttpsOptions;