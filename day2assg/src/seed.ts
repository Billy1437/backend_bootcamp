import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Concert } from "./entity/Concert";

async function seed() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(Concert);

  const concerts = repo.create([
    { name: "Radiohead Live", venue: "Madison Square Garden", date: "2026-06-01", stock: 5 },
    { name: "Coldplay Tour", venue: "O2 Arena", date: "2026-07-15", stock: 2 },
    { name: "Taylor Swift Eras", venue: "Wembley Stadium", date: "2026-08-20", stock: 10 },
    { name: "Sold Out Show", venue: "Tiny Club", date: "2026-09-01", stock: 0 },
  ]);

  await repo.save(concerts);
  console.log("Seeded", concerts.length, "concerts");
  await AppDataSource.destroy();
}

seed().catch(console.error);
