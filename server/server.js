const express = require("express");
const app = express();
const cors = require('cors');
const windyRoutes = require("./routes/windyRoutes.js");
const owmRoutes = require("./routes/owmRoutes.js");
const mmRoutes = require("./routes/mmRoutes.js");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './helpers/.env') });

app.use(cors());
app.use(express.json());

// Import and use windyRoutes
app.use("/api", windyRoutes);
app.use("/api", owmRoutes);
app.use("/api", mmRoutes);

// server frontend
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// serve the frontend for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Server port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 