import { Exclude, Type } from "class-transformer";
import { IsDate, IsNumber, IsPositive, ValidateNested } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IApplicationSettings } from "../../../types/settings";
import { FormSettings } from "./form-settings";

@Entity()
export class ApplicationSettings implements IApplicationSettings {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @ValidateNested()
  @Type(() => FormSettings)
  @ManyToOne(() => FormSettings, { cascade: true, eager: true })
  public profileForm!: FormSettings;

  @ValidateNested()
  @Type(() => FormSettings)
  @ManyToOne(() => FormSettings, { cascade: true, eager: true })
  public confirmationForm!: FormSettings;

  @IsDate()
  @Type(() => Date)
  @Column()
  public allowProfileFormFrom!: Date;

  @IsDate()
  @Type(() => Date)
  @Column()
  public allowProfileFormUntil!: Date;

  @IsNumber()
  @IsPositive()
  @Column()
  public hoursToConfirm!: number;
}
