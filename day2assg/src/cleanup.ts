import { AppDataSource } from "./data-source";
import { Ticket } from "./entity/Ticket";
import { Concert } from "./entity/Concert";

export async function runCleanup(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const now = new Date();

    const expired = await queryRunner.manager
      .getRepository(Ticket)
      .createQueryBuilder("ticket")
      .where("ticket.status = :status", { status: "PENDING" })
      .andWhere("ticket.expiresAt < :now", { now })
      .getMany();

    if (expired.length === 0) {
      await queryRunner.commitTransaction();
      console.log("Cleanup: no expired reservations found");
      return;
    }

    // Return stock for each expired ticket
    for (const ticket of expired) {
      await queryRunner.manager
        .getRepository(Concert)
        .increment({ id: ticket.concertId }, "stock", 1);

      ticket.status = "COMPLETED";
      await queryRunner.manager.save(Ticket, ticket);
    }

    await queryRunner.commitTransaction();
    console.log(`Cleanup: released ${expired.length} expired reservations`);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error("Cleanup failed, rolled back:", err);
  } finally {
    await queryRunner.release();
  }
}
