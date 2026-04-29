# Concert Ticketing Platform

A high-demand concert ticketing backend built with Node.js, TypeScript, Express, TypeORM, and SQLite as a assignment for Backend Bootcamp.

---

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **ORM:** TypeORM
- **Database:** SQLite (file-based)

---

## What I Learned

- **Migrations over synchronize** — `synchronize: true` is convenient but dangerous in production. Migrations force you to be intentional about every schema change and give you a rollback path.
- **SQLite limitations** — SQLite doesn't support `FOR UPDATE` row locking or adding constraints via `ALTER TABLE`. TypeORM works around this by recreating tables as `temporary_ticket` and renaming. Understanding why this happens required reading the actual generated SQL.
- **Partial indexes** — Before this, I only knew about standard indexes. A partial index only indexes rows matching a condition, making it much smaller and faster for specific query patterns like cleanup jobs.
- **ACID transactions in practice** — I understood transactions in theory but implementing `queryRunner.startTransaction()` / `rollbackTransaction()` and seeing the stock restore on failure made the concept concrete.
- **Race conditions** — Two simultaneous requests reading the same stock value before either writes is a real problem. SQLite serializes writes through transactions, which is why the transaction boundary matters, not just the individual queries.

---

## Sources
-[pros and cons of partial index] (https://stackoverflow.com/questions/283416/what-are-the-advantages-and-disadvantages-of-using-a-partial-index)
- [TypeORM Migration Docs](https://typeorm.io/migrations)
- [TypeORM QueryRunner Docs](https://typeorm.io/query-runner)
- [SQLite EXPLAIN QUERY PLAN](https://www.sqlite.org/eqp.html)
- [SQLite Partial Indexes](https://www.sqlite.org/partialindex.html)
- [SQLite ALTER TABLE Limitations](https://www.sqlite.org/lang_altertable.html)
- [ACID Properties — Wikipedia](https://en.wikipedia.org/wiki/ACID)

---

## Setup

```bash
npm install
npm run migration:run
npm run seed
npm run dev
```

Server runs on `http://localhost:4000`

---

## API Endpoints

| Method | Route       | Description                                  |
| ------ | ----------- | -------------------------------------------- |
| GET    | `/concerts` | List all concerts with available stock       |
| POST   | `/reserve`  | Reserve a ticket (expires in 5 mins)         |
| POST   | `/purchase` | Confirm a PENDING reservation                |
| POST   | `/cleanup`  | Manually trigger expired reservation cleanup |

### POST /reserve — Request Body

```json
{
  "userId": "user_1",
  "concertId": 3,
  "category": "VIP"
}
```

### POST /purchase — Request Body

```json
{
  "ticketId": 1,
  "userId": "user_1"
}
```

---

## How Double-Selling Was Prevented

When two users click "Reserve" at the same time for the last ticket, both requests could read `stock = 1`, both pass the stock check, and both decrement — resulting in `stock = -1` and two tickets sold for one seat.

This was solved using **database transactions with `queryRunner`**:

1. `queryRunner.startTransaction()` begins an atomic block
2. Stock is read and checked inside the transaction
3. Stock is decremented and the ticket is saved as a single unit
4. If anything fails, `queryRunner.rollbackTransaction()` undoes all changes

**Rollback proof:** A simulated crash was injected after the stock decrement but before the ticket save. The stock remained unchanged after rollback, confirmed via `GET /concerts` before and after.

**Initial stock (before reserve):**
![Initial stock](test_imgs/initial_stage.png)

**After reserve — stock decremented:**
![After reserve](<test_imgs/stage_after_reserve(no_rollback_yet).png>)

**Reserve request in Postman:**
![Reserve test](test_imgs/reseve_test.png)

**After rollback — stock restored:**
![After rollback](test_imgs/after_rollback.png)

---

## Indexing Strategy

### B-Tree Index on `concertId`

```sql
CREATE INDEX IDX_TICKET_CONCERT ON ticket (concertId);
```

Every query that looks up tickets for a specific concert (reservations, availability checks) filters by `concertId`. Without this index, SQLite scans every row in the ticket table. With it, the database jumps directly to matching rows.

**Proof:** `EXPLAIN QUERY PLAN SELECT * FROM ticket WHERE concertId = 3;`

```
SEARCH ticket USING INDEX IDX_TICKET_CONCERT (concertId=?)
```

### Partial Index on `status = 'PENDING'`

```sql
CREATE INDEX IDX_TICKET_PENDING_STATUS ON ticket (status) WHERE status = 'PENDING';
```

The cleanup job only ever queries for `PENDING` tickets. After months of operation, a table of 1 million tickets might have only 200 PENDING rows — the rest are COMPLETED.

A standard index would index all 1 million rows. The partial index only indexes the 200 PENDING rows, making it smaller, faster to scan, and it automatically shrinks as records move to COMPLETED. This makes the cleanup job fast regardless of how large the table grows.

**Why a Partial Index is better than a standard index for cleanup:**
A standard index on `status` would include every COMPLETED ticket ever sold — data the cleanup job never needs. The partial index is scoped only to the records that matter, giving the cleanup query a much smaller structure to search through.

**Proof:** `EXPLAIN QUERY PLAN SELECT * FROM ticket WHERE status = 'PENDING' AND expiresAt < datetime('now');`

```
SEARCH ticket USING INDEX IDX_TICKET_PENDING_STATUS (status=?)
```

![Index proof](test_imgs/testofboth_bindex_partial.png)

---

## Schema Migrations

| File                                      | Description                                                    |
| ----------------------------------------- | -------------------------------------------------------------- |
| `1777468294607-InitialSchema.ts`          | Creates `concert` and `ticket` tables with FK and B-Tree index |
| `1777468602408-AddTicketCategory.ts`      | Adds `category` column (VIP / General) to `ticket`             |
| `1777468657300-AddPartialIndexPending.ts` | Adds partial index on `status = 'PENDING'`                     |

---

## How AI Assisted

AI (Claude) was used to scaffold the project structure. It also helped explain concepts like partial indexes and transaction flow.


