import {ItemDto, ItemVersionDto, UserDto, VaultDto} from "@localful/common";

export const EventIdentifiers = {
    // Auth Events
    AUTH_LOGIN: "auth-login",
    AUTH_LOGOUT: "auth-logout",
    // User Events
    USER_CREATE: "user-create",
    USER_UPDATE: "user-update",
    USER_DELETE: "user-delete",
    // Vaults Events
    VAULT_CREATE: "vault-create",
    VAULT_UPDATE: "vault-update",
    VAULT_DELETE: "vault-delete",
    // Item Events
    ITEM_CREATE: "item-create",
    ITEM_DELETE: "item-delete",
    // Version Events
    ITEM_VERSION_CREATE: "item-version-create",
    ITEM_VERSION_DELETE: "item-version-delete",
} as const

export interface AuthLoginEvent {
    type: typeof EventIdentifiers.AUTH_LOGIN,
    detail: {
        userId: string
        sessionId: string
    }
}
export interface AuthLogoutEvent {
    type: typeof EventIdentifiers.AUTH_LOGOUT,
    detail: {
        userId: string
        sessionId: string
    }
}

export interface UserCreateEvent {
    type: typeof EventIdentifiers.USER_CREATE,
    detail: {
        user: UserDto
    }
}
export interface UserUpdateEvent {
    type: typeof EventIdentifiers.USER_UPDATE,
    detail: {
        sessionId: string
        user: UserDto
    }
}
export interface UserDeleteEvent {
    type: typeof EventIdentifiers.USER_DELETE,
    detail: {
        sessionId: string
        userId: string
    }
}

export interface VaultCreateEvent {
    type: typeof EventIdentifiers.VAULT_CREATE,
    detail: {
        sessionId: string
        vault: VaultDto
    }
}
export interface VaultUpdateEvent {
    type: typeof EventIdentifiers.VAULT_UPDATE,
    detail: {
        sessionId: string
        vault: VaultDto
    }
}
export interface VaultDeleteEvent {
    type: typeof EventIdentifiers.VAULT_DELETE,
    detail: {
        sessionId: string
        vaultId: string
        // This is required to allow consumers to know what users to inform of this action
        ownerId: string
    }
}

export interface ItemCreateEvent {
    type: typeof EventIdentifiers.ITEM_CREATE,
    detail: {
        sessionId: string
        item: ItemDto
    }
}
export interface ItemDeleteEvent {
    type: typeof EventIdentifiers.ITEM_DELETE,
    detail: {
        sessionId: string
        // This is required to allow consumers to know what vault this event occurred in
        vaultId: string
        itemId: string
    }
}

export interface ItemVersionCreateEvent {
    type: typeof EventIdentifiers.ITEM_VERSION_CREATE,
    detail: {
        sessionId: string
        version: ItemVersionDto
    }
}
export interface ItemVersionDeleteEvent {
    type: typeof EventIdentifiers.ITEM_VERSION_DELETE,
    detail: {
        sessionId: string
        // This is required to allow consumers to know what vault this event occurred in
        vaultId: string
        versionId: string
    }
}


export interface EventMap {
    // Auth events
    [EventIdentifiers.AUTH_LOGIN]: AuthLoginEvent,
    [EventIdentifiers.AUTH_LOGOUT]: AuthLogoutEvent,
    // User events
    [EventIdentifiers.USER_CREATE]: UserCreateEvent,
    [EventIdentifiers.USER_UPDATE]: UserUpdateEvent,
    [EventIdentifiers.USER_UPDATE]: UserUpdateEvent,
    // Vault events
    [EventIdentifiers.VAULT_CREATE]: VaultCreateEvent,
    [EventIdentifiers.VAULT_UPDATE]: VaultUpdateEvent,
    [EventIdentifiers.VAULT_DELETE]: VaultDeleteEvent,
    // Item events
    [EventIdentifiers.ITEM_CREATE]: ItemCreateEvent,
    [EventIdentifiers.ITEM_DELETE]: ItemDeleteEvent,
    [EventIdentifiers.ITEM_VERSION_CREATE]: ItemVersionCreateEvent,
    [EventIdentifiers.ITEM_VERSION_DELETE]: ItemVersionDeleteEvent,
}

export type ServerEvent =
  AuthLoginEvent | AuthLogoutEvent |
  UserCreateEvent | UserUpdateEvent | UserDeleteEvent |
  VaultCreateEvent | VaultUpdateEvent | VaultDeleteEvent |
  ItemCreateEvent | ItemDeleteEvent | ItemVersionCreateEvent | ItemVersionDeleteEvent;
export type EventIdentifiers = keyof EventMap

export type ExternalServerEvent =
  UserUpdateEvent | UserDeleteEvent |
  VaultCreateEvent | VaultUpdateEvent | VaultDeleteEvent |
  ItemCreateEvent | ItemDeleteEvent | ItemVersionCreateEvent | ItemVersionDeleteEvent;
