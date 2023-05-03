const express = require("express");
const cors = require("cors")
const dotenv = require("dotenv");

const app = express()

const db = require("./models")

dotenv.config();
app.use(cors())
app.use(express.json());


///////Routers////////////
const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;

db.sequelize.sync().then(()=>{app.listen(PORT, console.log(`Server started on port ${PORT}`));})



