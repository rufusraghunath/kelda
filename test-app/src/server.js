const express = require("express");

const app = express();
const port = 8080;

app.use(express.static("public"));

app.get("/", (_, res) => {
  return res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => console.log(`Open for business on port ${port}!`));
