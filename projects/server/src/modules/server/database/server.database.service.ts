import {DatabaseService} from "@services/database/database.service.js";
import {SystemError} from "@services/errors/base/system.error.js";
import {ServerSettingsDto, UpdateServerSettingsDto} from "@modules/server/server.service.js";
import {RawDatabaseServerSettings} from "@modules/server/database/database-settings.js";


export class ServerManagementDatabaseService {
  constructor(
    private readonly databaseService: DatabaseService
  ) {}

  private static mapApplicationField(fieldName: keyof ServerSettingsDto): keyof RawDatabaseServerSettings {
    switch (fieldName) {
      case "registrationEnabled":
        return "registration_enabled";
      case "createdAt":
        return "created_at";
      default:
        return fieldName;
    }
  }

  private static convertRawSettingsToDto(rawSettings: RawDatabaseServerSettings): ServerSettingsDto {
    return {
      registrationEnabled: rawSettings.registration_enabled,
      createdAt: rawSettings.created_at,
    }
  }

  private static getDatabaseError(e: any) {
    return new SystemError({
      message: "Unexpected error while creating server settings",
      originalError: e
    })
  }

  async getSettings(): Promise<ServerSettingsDto|null> {
    const sql = await this.databaseService.getSQL();

    let result: RawDatabaseServerSettings[] = [];
    try {
      result = await sql<RawDatabaseServerSettings[]>`SELECT * FROM settings ORDER BY created_at LIMIT 1`;
    }
    catch (e: any) {
      throw ServerManagementDatabaseService.getDatabaseError(e);
    }

    if (result.length > 0) {
      return ServerManagementDatabaseService.convertRawSettingsToDto(result[0]);
    }
    else {
      return null;
    }
  }

  async updateSettings(updateSettingsDto: UpdateServerSettingsDto): Promise<ServerSettingsDto> {
    const sql = await this.databaseService.getSQL();

    let result: RawDatabaseServerSettings[] = [];
    try {
      result = await sql<RawDatabaseServerSettings[]>`
        INSERT INTO settings(registration_enabled) 
        VALUES (${updateSettingsDto.registrationEnabled})
        RETURNING *;
       `;
    }
    catch (e: any) {
      throw ServerManagementDatabaseService.getDatabaseError(e);
    }

    if (result.length > 0) {
      return ServerManagementDatabaseService.convertRawSettingsToDto(result[0]);
    }
    else {
      throw new SystemError({
        message: "Unexpected error returning settings after update",
      })
    }
  }
}
