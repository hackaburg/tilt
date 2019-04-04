import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ unique: true })
  public email!: string;

  @Column()
  public password!: string;

  @Column()
  public verifyToken!: string;

  @Column()
  public didVerifyEmail: boolean = false;

  @Column()
  public createdAt!: Date;

  @Column()
  public updatedAt!: Date;
}
