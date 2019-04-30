import { IsOptional, IsString, IsUrl } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IFrontendSettings } from "../../../types/settings";

@Entity()
export class FrontendSettings implements IFrontendSettings {
  @PrimaryGeneratedColumn()
  public id!: number;

  @IsOptional()
  @IsString()
  @Column()
  public colorGradientStart: string = "#53bd9a";

  @IsOptional()
  @IsString()
  @Column()
  public colorGradientEnd: string = "#56d175";

  @IsOptional()
  @IsString()
  @Column()
  public colorLink: string = "#007bff";

  @IsOptional()
  @IsString()
  @Column()
  public colorLinkHover: string = "#0056b3";

  @IsOptional()
  @IsUrl()
  @Column()
  public loginSignupImage: string = "http://placehold.it/300x300";

  @IsOptional()
  @IsUrl()
  @Column()
  public sidebarImage: string = "http://placehold.it/300x300";
}
