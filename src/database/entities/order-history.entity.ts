import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "order_history" })
export class OrderHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderId!: string;

  @Column()
  baseToken!: string;

  @Column()
  quoteToken!: string;

  @Column("decimal")
  amount!: number;

  @Column()
  side!: string;

  @Column({ nullable: true })
  chosenDex!: string;

  @Column("decimal", { nullable: true })
  quotePrice!: number;

  @Column("decimal", { nullable: true })
  finalPrice!: number;

  @Column({ nullable: true })
  txHash!: string;

  @Column()
  status!: string;

  @Column({ nullable: true })
  errorMessage!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
