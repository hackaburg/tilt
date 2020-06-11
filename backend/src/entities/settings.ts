import { Type } from "class-transformer";
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ApplicationSettings } from "./application-settings";

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Type(() => ApplicationSettings)
  @OneToOne(() => ApplicationSettings, { cascade: true, eager: true })
  @JoinColumn()
  public application!: ApplicationSettings;
  @Type(() => FrontendSettings)
  @Column(() => FrontendSettings)
  public frontend!: FrontendSettings;
  @Type(() => EmailSettings)
  @Column(() => EmailSettings)
  public email!: EmailSettings;
}

export class FrontendSettings {
  @Column()
  public colorGradientStart!: string;
  @Column()
  public colorGradientEnd!: string;
  @Column()
  public colorLink!: string;
  @Column()
  public colorLinkHover!: string;
  @Column()
  public loginSignupImage!: string;
  @Column()
  public sidebarImage!: string;
}

export class EmailSettings {
  @Column()
  public sender!: string;
  @Type(() => EmailTemplate)
  @Column(() => EmailTemplate)
  public verifyEmail!: EmailTemplate;
  @Type(() => EmailTemplate)
  @Column(() => EmailTemplate)
  public forgotPasswordEmail!: EmailTemplate;
}

export class EmailTemplate {
  @Column()
  public subject!: string;
  @Column()
  public htmlTemplate!: string;
  @Column()
  public textTemplate!: string;
}
