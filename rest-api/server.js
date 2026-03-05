import "dotenv/config";
import express from "express";
import { router } from "./routes/router.js";

const app = express();

app.use(express.json());

app.listen(8080, () => {
  console.log("Server is running on port http://localhost:8080");
});

app.use("/api/users", router);
