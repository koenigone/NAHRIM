const express = require("express");
const app = express();
const cors = require('cors');
const windyRoutes = require("./routes/windyRoutes.js");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './helpers/.env') });

app.use(cors());
app.use(express.json());

// Import and use windyRoutes
app.use("/api", windyRoutes);

// Server port
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});