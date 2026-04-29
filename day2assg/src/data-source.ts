import "reflect-metadata";
import { DataSource } from "typeorm";
import { Concert } from "./entity/Concert";
import { Ticket } from "./entity/Ticket";

// sqlite

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "concert.sqlite",
  synchronize: false,
  logging: true,
  entities: [Concert, Ticket],
  migrations: ["src/migration/*.ts"],
});
