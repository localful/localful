import {NextFunction, Request, Response} from "express";

import {ItemDto, ItemsURLParams, ItemVersionDto, ItemVersionsURLParams} from "@localful/common";

import {validateSchema} from "@common/schema-validator.js";
import {HttpStatusCodes} from "@common/http-status-codes.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {ItemsService} from "@modules/items/items.service.js";


export class ItemsHttpController {
  constructor(
      private readonly itemsService: ItemsService,
      private readonly accessControlService: AccessControlService,
  ) {}

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const itemDto = await validateSchema(req.body, ItemDto);

      const createdItemDto = await this.itemsService.createItem(requestUser, itemDto);
      return res.status(HttpStatusCodes.CREATED).json(createdItemDto);
    }
    catch (error) {
      next(error)
    }
  }

  async getItem(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const params = await validateSchema(req.params, ItemsURLParams);

      const itemDto = await this.itemsService.getItem(requestUser, params.itemId);
      return res.status(HttpStatusCodes.OK).json(itemDto)
    }
    catch (error) {
      next(error)
    }
  }

  async getItems(req: Request, res: Response, next: NextFunction) {
    return res.sendStatus(HttpStatusCodes.NOT_IMPLEMENTED)
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const params = await validateSchema(req.params, ItemsURLParams);
      const requestUser = await this.accessControlService.validateAuthentication(req);

      await this.itemsService.deleteItem(requestUser, params.itemId);
      return res.sendStatus(HttpStatusCodes.OK)
    }
    catch (error) {
      next(error)
    }
  }

  async createVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const versionDto = await validateSchema(req.body, ItemVersionDto);

      const createdVersionDto = await this.itemsService.createVersion(requestUser, versionDto);
      return res.status(HttpStatusCodes.CREATED).json(createdVersionDto);
    }
    catch (error) {
      next(error)
    }
  }

  async getVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const requestUser = await this.accessControlService.validateAuthentication(req);
      const params = await validateSchema(req.params, ItemVersionsURLParams);

      const user = await this.itemsService.getVersion(requestUser, params.versionId);
      return res.status(HttpStatusCodes.OK).json(user)
    }
    catch (error) {
      next(error)
    }
  }

  async deleteVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const params = await validateSchema(req.params, ItemVersionsURLParams);
      const requestUser = await this.accessControlService.validateAuthentication(req);

      await this.itemsService.deleteVersion(requestUser, params.versionId);
      return res.sendStatus(HttpStatusCodes.OK)
    }
    catch (error) {
      next(error)
    }
  }

  async getVersions(req: Request, res: Response, next: NextFunction) {
    return res.sendStatus(HttpStatusCodes.NOT_IMPLEMENTED)
  }
}
