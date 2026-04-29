import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { Concert } from "./Concert";


export type TicketStatus = "PENDING" | "COMPLETED";
export type TicketCategory = "VIP" | "General";

@Entity()
@Index("IDX_TICKET_CONCERT", ["concertId"])
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @Column()
  concertId!: number;

  @ManyToOne(() => Concert)
  @JoinColumn({ name: "concertId" })
  concert!: Concert;

  @Column({ type: "varchar", default: "PENDING" })
  status!: TicketStatus;


  // expires at is stored because the cleanup job can query 
  // example -> when user finish payment, the ticket will be created with current + 10 minutes
  // then, after 10 minutes, if the user doesn't finish the payment,
  // the cleanup job will find the ticket and set the status to EXPIRED
  
  @Column({ type: "datetime" })
  expiresAt!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "varchar", default: "General" })
  category!: TicketCategory;
}
