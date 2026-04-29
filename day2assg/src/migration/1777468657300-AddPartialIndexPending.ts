import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPartialIndexPending1777468657300 implements MigrationInterface {
  name = "AddPartialIndexPending1777468657300";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_TICKET_PENDING_STATUS" ON "ticket" ("status") WHERE status = 'PENDING'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_TICKET_PENDING_STATUS"`);
  }
}
