import server from "./src/app.js";
import config from "./src/config/config.js";
import connectDb from "./src/lib/db.js";

server.listen(config.port, (req, res) => {
  console.log(`Server is running on port ${config.port}`);
  connectDb();
});
