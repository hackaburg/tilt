import { Type } from "class-transformer";
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApplicationSettings } from "./application-settings";

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @UpdateDateColumn()
  public readonly updatedAt!: Date;
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
  @Column(() => EmailTemplate)
  public forgotPasswordEmail!: EmailTemplate;
  @Type(() => EmailTemplate)
  @Column(() => EmailTemplate)
  public admittedEmail!: EmailTemplate;
}

export class EmailTemplate {
  @Column()
  public subject!: string;
  @Column("text")
  public htmlTemplate!: string;
  @Column("text")
  public textTemplate!: string;
}

/**
 * Value number of characters that can be stored
 * in the database for the email template
 */
export const EmailTemplateSize = 65_536;
