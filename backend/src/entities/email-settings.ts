import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IEmailSettings } from "../../../types/settings";

@Entity()
export class EmailSettings implements IEmailSettings {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public templateVerifyEmail: string = "";

  @Column()
  public templateForgotPassword: string = "";
}
