import { Injectable, Logger } from '@nestjs/common';
import { Transporter, SMTPTransport, Mail, createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from './config-keys.enum';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private enableLogs = true;
  private nodemailerTransporter: Transporter;
  private host: string | undefined;
  private port: number | undefined;
  private fromEmail: string | undefined;
  private fromName: string | undefined;
  private user: string | undefined;
  private password: string | undefined;
  private configured = false;
  noMoreInit = false;
  /**
   * Creación del transporter con el servicio de configuracion
   */
  constructor(private readonly configService: ConfigService) {
    this.init();
  }

  async init(): Promise<boolean> {
    if (this.noMoreInit) {
      return false;
    }

    this.fromName = this.configService.get<string>(ConfigKeys.SMTP_FROM_NAME);
    this.fromEmail = this.configService.get<string>(ConfigKeys.SMTP_FROM_EMAIL);
    this.host = this.configService.get<string>(ConfigKeys.SMTP_HOST);
    this.port = this.configService.get<number>(ConfigKeys.SMTP_PORT);
    this.user = this.configService.get<string>(ConfigKeys.SMTP_USER);
    this.password = this.configService.get<string>(ConfigKeys.SMTP_PASSWORD);
    if (this.host && this.port) {
      const options: SMTPTransport.Options = {
        host: this.host,
        port: this.port,
        ignoreTLS: true,
        secure: false,
        name: 'dominio.com',
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user: this.user,
          pass: this.password,
        },
        transactionLog: false,
        logger: false,
      };
      this.nodemailerTransporter = createTransport(options);
      this.configured = true;
      this.enableLogs
        ? this.logger.log(
            `SMTP transport configured: ${options.host}:${options.port}`,
          )
        : false;
      return this.configured;
    } else {
      this.logger.warn('SMTP Transport is not configured.');
      this.noMoreInit = true;
      return false;
    }
  }

  /**
   *
   * Envia un email de forma directa
   */
  async send(options: Mail.Options): Promise<{ sent: boolean; response: any }> {
    if (this.configured) {
      this.enableLogs
        ? this.logger.log(`Sending email to ${options.to}`)
        : false;

      try {
        const result = await this.nodemailerTransporter.sendMail(options);

        this.enableLogs
          ? this.logger.log(`Response: ${result.response}`)
          : false;

        return {
          sent: true,
          response: result,
        };
      } catch (error) {
        this.logger.error(
          `Error enviando email a ${options.to} - ${options.subject}`,
          error,
        );

        return {
          sent: false,
          response: error.response || JSON.stringify(error),
        };
      }
    } else {
      this.logger.warn('El servicio SMTP no está configurado.');
      this.logger.log(
        `Email no enviado: ${options.to} -  ${options.subject}, adjuntos: ${options.attachments?.length || 0}`,
      );
      return { sent: false, response: 'No configurado' };
    }
  }
}
