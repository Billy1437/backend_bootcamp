import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import concertsRouter from "./routes/concerts";
import reserveRouter from "./routes/reserve";
import purchaseRouter from "./routes/purchase";
import { runCleanup } from "./cleanup";

const app = express();
app.use(express.json());

app.use("/concerts", concertsRouter);
app.use("/reserve", reserveRouter);
app.use("/purchase", purchaseRouter);

// Manual trigger for cleanup — also runs on a 5-minute interval
app.post("/cleanup", async (_req, res) => {
  await runCleanup();
  res.json({ message: "Cleanup complete" });
});

setInterval(runCleanup, 5 * 60 * 1000);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(4000, () => console.log("Server running on port 4000"));
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
