import server from "./app";

const PORT = 5000;
server.listen(PORT, () => {console.log('Express server listening on portt ' + PORT);});
