import { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source";
import { Concert } from "../entity/Concert";
import { Ticket } from "../entity/Ticket";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { userId, concertId, category } = req.body as {
    userId: string;
    concertId: number;
    category?: "VIP" | "General";
  };

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  // this is the atomic transaction
  // if any of the steps fail, the entire transaction will be rolled back
  try {
  
    // SQLite serializes writes at the file level — the transaction itself
    // prevents concurrent stock reads, so no pessimistic_write lock needed
    const concert = await queryRunner.manager
      .getRepository(Concert)
      .createQueryBuilder("concert")
      .where("concert.id = :id", { id: concertId })
      .getOne();

    if (!concert) {
      await queryRunner.rollbackTransaction();
      res.status(404).json({ error: "Concert not found" });
      return;
    }

    if (concert.stock <= 0) {
      await queryRunner.rollbackTransaction();
      res.status(409).json({ error: "No tickets available" });
      return;
    }

    // Decrement stock
    concert.stock -= 1;
    await queryRunner.manager.save(Concert, concert);

    // Create the reservation
    // expires at is set to 5 minutes from now
    // if the user doesn't finish the payment within 5 minutes, the ticket will be expired
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    // we create the ticket with pending status
    // and then the cleanup job will find the ticket and set the status to EXPIRED
    
    const ticket = queryRunner.manager.getRepository(Ticket).create({
      userId,
      concertId,
      status: "PENDING",
      category: category ?? "General",
      expiresAt,
    });
    await queryRunner.manager.save(Ticket, ticket);

    await queryRunner.commitTransaction();
    res.status(201).json(ticket);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error("Reserve failed, rolled back:", err);
    res.status(500).json({ error: "Reservation failed" });
  } finally {
    await queryRunner.release();
  }
});

export default router;
