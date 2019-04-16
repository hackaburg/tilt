import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IEmailTemplate } from "../../../types/settings";

@Entity()
export class EmailTemplate implements IEmailTemplate {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public htmlTemplate: string = "";

  @Column()
  public textTemplate: string = "";
}
