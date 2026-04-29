// this is the initial schema migration
// and next i will need to do the migration for category column


import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777468294607 implements MigrationInterface {
    name = 'InitialSchema1777468294607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "concert" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "venue" varchar NOT NULL, "date" varchar NOT NULL, "stock" integer NOT NULL DEFAULT (0))`);
        await queryRunner.query(`CREATE TABLE "ticket" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "concertId" integer NOT NULL, "status" varchar NOT NULL DEFAULT ('PENDING'), "expiresAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_CONCERT" ON "ticket" ("concertId") `);
        await queryRunner.query(`DROP INDEX "IDX_TICKET_CONCERT"`);
        await queryRunner.query(`CREATE TABLE "temporary_ticket" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "concertId" integer NOT NULL, "status" varchar NOT NULL DEFAULT ('PENDING'), "expiresAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_ef8e1c3effd13564a3e3dd569ac" FOREIGN KEY ("concertId") REFERENCES "concert" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_ticket"("id", "userId", "concertId", "status", "expiresAt", "createdAt") SELECT "id", "userId", "concertId", "status", "expiresAt", "createdAt" FROM "ticket"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`ALTER TABLE "temporary_ticket" RENAME TO "ticket"`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_CONCERT" ON "ticket" ("concertId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_TICKET_CONCERT"`);
        await queryRunner.query(`ALTER TABLE "ticket" RENAME TO "temporary_ticket"`);
        await queryRunner.query(`CREATE TABLE "ticket" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "concertId" integer NOT NULL, "status" varchar NOT NULL DEFAULT ('PENDING'), "expiresAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`INSERT INTO "ticket"("id", "userId", "concertId", "status", "expiresAt", "createdAt") SELECT "id", "userId", "concertId", "status", "expiresAt", "createdAt" FROM "temporary_ticket"`);
        await queryRunner.query(`DROP TABLE "temporary_ticket"`);
        await queryRunner.query(`CREATE INDEX "IDX_TICKET_CONCERT" ON "ticket" ("concertId") `);
        await queryRunner.query(`DROP INDEX "IDX_TICKET_CONCERT"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`DROP TABLE "concert"`);
    }

}
