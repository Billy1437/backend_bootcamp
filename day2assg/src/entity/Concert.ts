import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Concert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  venue!: string;

  @Column()
  date!: string;

  @Column({ type: "int", default: 0 })
  stock!: number;
}
