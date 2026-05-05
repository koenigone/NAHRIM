const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const windyRoutes = require("./routes/windyRoutes.js");
const owmRoutes = require("./routes/owmRoutes.js");
const mmRoutes = require("./routes/mmRoutes.js");
const dailySyncRoutes = require("./routes/dailySyncRoutes.js");

require("dotenv").config({ path: path.resolve(__dirname, "./helpers/.env") });

app.use(cors());
app.use(express.json());

app.use("/api", windyRoutes);
app.use("/api", owmRoutes);
app.use("/api", mmRoutes);
app.use("/api", dailySyncRoutes);

const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
