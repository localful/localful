import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {NestApplicationOptions, VersioningType} from "@nestjs/common";
import {ErrorFilter} from "./common/errors/error.filter";
import {ConfigService} from "./services/config/config";


export async function createApp(options?: NestApplicationOptions) {
  const app = await NestFactory.create(AppModule, options || {});
  const configService = app.get<ConfigService>(ConfigService);

  app.enableCors({
    origin: configService.config.general.corsOrigins
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new ErrorFilter());

  return app
}
