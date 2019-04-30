import { IsOptional, IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IEmailTemplate } from "../../../types/settings";

@Entity()
export class EmailTemplate implements IEmailTemplate {
  constructor(initializeDefaults?: boolean) {
    if (initializeDefaults) {
      this.subject = "";
      this.htmlTemplate = "";
      this.textTemplate = "";
    }
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @IsOptional()
  @IsString()
  @Column()
  public subject!: string;

  @IsOptional()
  @IsString()
  @Column()
  public htmlTemplate!: string;

  @IsOptional()
  @IsString()
  @Column()
  public textTemplate!: string;
}
