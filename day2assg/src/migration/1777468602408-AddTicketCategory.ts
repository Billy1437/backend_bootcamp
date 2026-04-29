import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTicketCategory1777468602408 implements MigrationInterface {
    name = 'AddTicketCategory1777468602408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_TICKET_CONCERT"`);
        await queryRunner.query(`CREATE TABLE "temporary_ticket" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "concertId" integer NOT NULL, "status" varchar NOT NULL DEFAULT ('PENDING'), "expiresAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "category" varchar NOT NULL DEFAULT ('General'), CONSTRAINT "FK_ef8e1c3effd13564a3e3dd569ac" FOREIGN KEY ("concertId") REFERENCES "concert" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_ticket"("id", "userId", "concertId", "status", "expiresAt", "createdAt") SELECT "id", "userId", "concertId", "status", "expiresAt", "createdAt" FROM "ticket"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`ALTER TABLE "temporary_ticket" RENAME TO "ticket"`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_CONCERT" ON "ticket" ("concertId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_TICKET_CONCERT"`);
        await queryRunner.query(`ALTER TABLE "ticket" RENAME TO "temporary_ticket"`);
        await queryRunner.query(`CREATE TABLE "ticket" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "concertId" integer NOT NULL, "status" varchar NOT NULL DEFAULT ('PENDING'), "expiresAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_ef8e1c3effd13564a3e3dd569ac" FOREIGN KEY ("concertId") REFERENCES "concert" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "ticket"("id", "userId", "concertId", "status", "expiresAt", "createdAt") SELECT "id", "userId", "concertId", "status", "expiresAt", "createdAt" FROM "temporary_ticket"`);
        await queryRunner.query(`DROP TABLE "temporary_ticket"`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_CONCERT" ON "ticket" ("concertId") `);
    }

}
