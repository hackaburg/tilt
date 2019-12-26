import { Exclude } from "class-transformer";
import { IsHexColor, IsString, IsUrl } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IFrontendSettings } from "../../../types/settings";

@Entity()
export class FrontendSettings implements IFrontendSettings {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @IsString()
  @IsHexColor()
  @Column()
  public colorGradientStart!: string;

  @IsString()
  @IsHexColor()
  @Column()
  public colorGradientEnd!: string;

  @IsString()
  @IsHexColor()
  @Column()
  public colorLink!: string;

  @IsString()
  @IsHexColor()
  @Column()
  public colorLinkHover!: string;

  @IsUrl()
  @Column()
  public loginSignupImage!: string;

  @IsUrl()
  @Column()
  public sidebarImage!: string;
}
