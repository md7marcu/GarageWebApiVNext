import server from "./app";

const PORT = 5001;
server.listen(PORT, () => {console.log("Express server listening on portt " + PORT); });
