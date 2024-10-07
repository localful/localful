import http, {Server} from "node:http";
import {PumpIt} from "pumpit";
import cors from "cors";
import express, {NextFunction, Request, Response} from "express";
import {ErrorIdentifiers} from "@localful/common";

import {EnvironmentService} from "@services/environment/environment.service.js";
import {DataStoreService} from "@services/data-store/data-store.service.js";
import {DatabaseService} from "@services/database/database.service.js";
import {EmailService} from "@services/email/email.service.js";
import {PasswordService} from "@services/password/password.service.js";
import {TokenService} from "@services/token/token.service.js";
import {BaseHttpController} from "@modules/base/base.http.js";
import {AuthService} from "@modules/auth/auth.service.js";
import {UsersService} from "@modules/users/users.service.js";
import {AccessControlService} from "@modules/auth/access-control.service.js";
import {UsersDatabaseService} from "@modules/users/database/users.database.service.js";
import {AuthHttpController} from "@modules/auth/auth.http.js";
import {UsersHttpController} from "@modules/users/users.http.js";
import {VaultsDatabaseService} from "@modules/vaults/database/vaults.database.service.js";
import {VaultsService} from "@modules/vaults/vaults.service.js";
import {VaultsHttpController} from "@modules/vaults/vaults.http.js";
import {httpErrorHandler} from "@services/errors/http-error-handler.js";
import {HttpStatusCodes} from "@common/http-status-codes.js";
import {createCorsOptions} from "@common/validate-cors.js";
import {SyncWebsocketController} from "@modules/sync/sync.websockets.js";
import {EventsService} from "@services/events/events.service.js";
import {SyncService} from "@modules/sync/sync.service.js";
import {SyncHttpController} from "@modules/sync/sync.http.js";
import {ServerManagementService} from "@modules/server/server.service.js";
import {ServerManagementHttpController} from "@modules/server/server.http.js";
import {ServerManagementDatabaseService} from "@modules/server/database/server.database.service.js";
import {ItemsService} from "@modules/items/items.service.js";
import {ItemsHttpController} from "@modules/items/items.http.js";
import {ItemsDatabaseService} from "@modules/items/database/items.database.service.js";


/**
 * The main application class which loads the server and all dependencies.
 *
 * --- Dependency Injection ---
 * Dependencies throughout the app don't have any knowledge of the DI system, the logic which defines the dependencies
 * and creates the IoC container is all within this top-level application class.
 * This is useful for things like unit testing as dependencies can be manually injected without having to care
 * about the app wide IoC container.
 *
 * --- Routing ---
 * HttpController classes are defined at the module level with methods to handle different routes, however the
 * actual wiring up of routes is all handled within this application class by binding controller methods to the
 * required routes.
 *
 */
export class Application {
    private readonly container: PumpIt;

    /**
     * Prepare the application, which involves setting up the dependency injection container.
     */
    constructor() {
        this.container = new PumpIt()

        // Global services
        this.container.bindClass(EnvironmentService, { value: EnvironmentService}, {scope: "SINGLETON"})
        this.container.bindClass(DataStoreService, { value: DataStoreService, inject: [EnvironmentService]}, {scope: "SINGLETON"})
        this.container.bindClass(DatabaseService, { value: DatabaseService, inject: [EnvironmentService]}, {scope: "SINGLETON"})
        this.container.bindClass(EmailService, { value: EmailService, inject: [EnvironmentService]}, {scope: "SINGLETON"})
        this.container.bindClass(PasswordService, { value: PasswordService}, {scope: "SINGLETON"})
        this.container.bindClass(TokenService, { value: TokenService, inject: [EnvironmentService, DataStoreService]}, {scope: "SINGLETON"})
        this.container.bindClass(EventsService, { value: EventsService }, {scope: "SINGLETON"})

        // Server module
        this.container.bindClass(ServerManagementDatabaseService, { value: ServerManagementDatabaseService, inject: [DatabaseService] }, {scope: "SINGLETON"})
        this.container.bindClass(ServerManagementService, { value: ServerManagementService, inject: [DatabaseService, DataStoreService, AccessControlService, ServerManagementDatabaseService] }, {scope: "SINGLETON"})
        this.container.bindClass(ServerManagementHttpController, { value: ServerManagementHttpController, inject: [AccessControlService, ServerManagementService] }, {scope: "SINGLETON"})

        // Base module
        this.container.bindClass(BaseHttpController, { value: BaseHttpController}, {scope: "SINGLETON"})

        // Auth module
        this.container.bindClass(AuthService, { value: AuthService, inject: [UsersService, TokenService, EnvironmentService, EmailService, EventsService]}, {scope: "SINGLETON"})
        this.container.bindClass(AccessControlService, { value: AccessControlService, inject: [UsersDatabaseService, TokenService] }, {scope: "SINGLETON"})
        this.container.bindClass(AuthHttpController, { value: AuthHttpController, inject: [AuthService, AccessControlService]}, {scope: "SINGLETON"})

        // Users module
        this.container.bindClass(UsersDatabaseService, { value: UsersDatabaseService, inject: [DatabaseService]}, {scope: "SINGLETON"})
        this.container.bindClass(UsersService, { value: UsersService, inject: [UsersDatabaseService, AccessControlService, EventsService, ServerManagementService]}, {scope: "SINGLETON"})
        this.container.bindClass(UsersHttpController, { value: UsersHttpController, inject: [UsersService, TokenService, AccessControlService]}, {scope: "SINGLETON"})

        // Vault module
        this.container.bindClass(VaultsDatabaseService, { value: VaultsDatabaseService, inject: [DatabaseService]}, {scope: "SINGLETON"})
        this.container.bindClass(VaultsService, { value: VaultsService, inject: [VaultsDatabaseService, AccessControlService, EventsService]}, {scope: "SINGLETON"})
        this.container.bindClass(VaultsHttpController, { value: VaultsHttpController, inject: [VaultsService, AccessControlService]}, {scope: "SINGLETON"})

        // Items module
        this.container.bindClass(ItemsDatabaseService, {value: ItemsDatabaseService, inject: [DatabaseService]}, {scope: "SINGLETON"})
        this.container.bindClass(ItemsService, {value: ItemsService, inject: [AccessControlService, EventsService, ItemsDatabaseService, VaultsService]}, {scope: "SINGLETON"})
        this.container.bindClass(ItemsHttpController, {value: ItemsHttpController, inject: []}, {scope: "SINGLETON"})

        // Sync module
        this.container.bindClass(SyncService, {value: SyncService, inject: [EventsService, DataStoreService, VaultsDatabaseService]}, {scope: "SINGLETON"})
        this.container.bindClass(SyncHttpController, {value: SyncHttpController, inject: [AccessControlService, SyncService]}, {scope: "SINGLETON"})
        this.container.bindClass(SyncWebsocketController, { value: SyncWebsocketController, inject: [EnvironmentService, SyncService] }, {scope: "SINGLETON"})
    }

    /**
     * Create and set up the server, running health checks, defining routes etc
     */
    async init(): Promise<Server> {
        // Basic Express and HTTP server setup
        const app = express()
        const httpServer = http.createServer(app)
        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.disable("x-powered-by")

        // Cors setup
        const envService = this.container.resolve<EnvironmentService>(EnvironmentService);
        const corsOptions = createCorsOptions(envService)
        app.use(cors(corsOptions))

        // GNU Terry Pratchett (http://www.gnuterrypratchett.com/)
        app.use(function (req: Request, res: Response, next: NextFunction) {
            res.set("X-Clacks-Overhead", "GNU Terry Pratchett");
            next();
        });

        // Base module routes
        const baseHttpController = this.container.resolve<BaseHttpController>(BaseHttpController);
        app.get("/", baseHttpController.sendWelcomeMessage.bind(baseHttpController))
        app.get("/v1", baseHttpController.sendWelcomeMessage.bind(baseHttpController))

        // Server module routes
        const serverManagementHttpController = this.container.resolve<ServerManagementHttpController>(ServerManagementHttpController);
        app.get("/v1/server/info", serverManagementHttpController.getInfo.bind(serverManagementHttpController));
        app.get("/v1/server/health", serverManagementHttpController.requestHealthCheck.bind(serverManagementHttpController));
        app.get("/v1/server/settings", serverManagementHttpController.getSettings.bind(serverManagementHttpController));
        app.patch("/v1/server/settings", serverManagementHttpController.updateSettings.bind(serverManagementHttpController));

        // Auth module routes
        const authHttpController = this.container.resolve<AuthHttpController>(AuthHttpController);
        app.post("/v1/auth/login", authHttpController.login.bind(authHttpController))
        app.post("/v1/auth/logout", authHttpController.logout.bind(authHttpController))
        app.post("/v1/auth/refresh", authHttpController.refresh.bind(authHttpController))
        app.get("/v1/auth/check", authHttpController.check.bind(authHttpController))
        app.get("/v1/auth/verify-email", authHttpController.requestEmailVerification.bind(authHttpController))
        app.post("/v1/auth/verify-email", authHttpController.verifyEmail.bind(authHttpController))
        app.get("/v1/auth/change-email", authHttpController.requestEmailChange.bind(authHttpController))
        app.post("/v1/auth/change-email", authHttpController.changeEmail.bind(authHttpController))
        app.get("/v1/auth/change-password", authHttpController.requestPasswordChange.bind(authHttpController))
        app.post("/v1/auth/change-password", authHttpController.changePassword.bind(authHttpController))

        // Users module routes
        const usersHttpController = this.container.resolve<UsersHttpController>(UsersHttpController);
        app.post("/v1/users", usersHttpController.createUser.bind(usersHttpController))
        app.get("/v1/users/:userId", usersHttpController.getUser.bind(usersHttpController))
        app.patch("/v1/users/:userId", usersHttpController.updateUser.bind(usersHttpController))
        app.delete("/v1/users/:userId", usersHttpController.deleteUser.bind(usersHttpController));

        // Vaults module routes
        const vaultsHttpController = this.container.resolve<VaultsHttpController>(VaultsHttpController);
        app.post("/v1/vaults", vaultsHttpController.createVault.bind(vaultsHttpController))
        app.get("/v1/vaults/:vaultId", vaultsHttpController.getVault.bind(vaultsHttpController))
        app.patch("/v1/vaults/:vaultId", vaultsHttpController.updateVault.bind(vaultsHttpController))
        app.delete("/v1/vaults/:vaultId", vaultsHttpController.deleteVault.bind(vaultsHttpController));

        // Items module routes
        const itemsHttpController = this.container.resolve<ItemsHttpController>(ItemsHttpController);
        app.post("/v1/items", itemsHttpController.createItem.bind(itemsHttpController))
        app.get("/v1/items/:itemId", itemsHttpController.getItem.bind(itemsHttpController))
        app.delete("/v1/items/:itemId", itemsHttpController.deleteItem.bind(itemsHttpController))
        app.get("/v1/versions", itemsHttpController.createVersion.bind(itemsHttpController))
        app.get("/v1/versions/:versionId", itemsHttpController.getVersion.bind(itemsHttpController))
        app.get("/v1/versions/:versionId", itemsHttpController.deleteVersion.bind(itemsHttpController))

        // Sync module routes and websocket server
        const syncHttpController = this.container.resolve<SyncHttpController>(SyncHttpController)
        app.get("/v1/sync/ticket", syncHttpController.getConnectionTicket.bind(syncHttpController))

        const syncWebsocketController = this.container.resolve<SyncWebsocketController>(SyncWebsocketController)
        await syncWebsocketController.init(httpServer, {path: "/v1/sync"})

        // Setup HTTP error handlers to serve 404s and server error responses
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- next is required to match Express error handler signature.
        app.use(function (req: Request, res: Response, next: NextFunction) {
            res.status(HttpStatusCodes.NOT_FOUND).send({
                identifier: ErrorIdentifiers.NOT_FOUND,
                statusCode: HttpStatusCodes.NOT_FOUND,
                message: "The route you requested could not be found.",
            })
        });
        app.use(httpErrorHandler)

        return httpServer
    }

    /**
     * Retrieve a dependency from the app IoC container.
     */
    getDependency<T>(dependency: any) {
        return this.container.resolve<T>(dependency);
    }
}
