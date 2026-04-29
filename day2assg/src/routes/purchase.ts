import { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source";
import { Ticket } from "../entity/Ticket";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { ticketId, userId } = req.body as { ticketId: number; userId: string };

  const repo = AppDataSource.getRepository(Ticket);
  const ticket = await repo.findOne({ where: { id: ticketId, userId } });

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (ticket.status !== "PENDING") {
    res.status(409).json({ error: `Ticket is already ${ticket.status}` });
    return;
  }

  if (ticket.expiresAt < new Date()) {
    res.status(410).json({ error: "Reservation has expired" });
    return;
  }

  ticket.status = "COMPLETED";
  await repo.save(ticket);

  res.json(ticket);
});

export default router;
