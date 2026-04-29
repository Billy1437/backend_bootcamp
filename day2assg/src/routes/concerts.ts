import { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source";
import { Concert } from "../entity/Concert";

const router = Router();

// get the concerts
router.get("/", async (_req: Request, res: Response) => {
  const concerts = await AppDataSource.getRepository(Concert).find();
  res.json(concerts);
});

export default router;
