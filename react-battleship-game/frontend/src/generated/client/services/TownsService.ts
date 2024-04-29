/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BattleshipArea } from '../models/BattleshipArea';
import type { BattleshipMove } from '../models/BattleshipMove';
import type { ConversationArea } from '../models/ConversationArea';
import type { GameInfo } from '../models/GameInfo';
import type { PosterSessionArea } from '../models/PosterSessionArea';
import type { Town } from '../models/Town';
import type { TownCreateParams } from '../models/TownCreateParams';
import type { TownCreateResponse } from '../models/TownCreateResponse';
import type { TownSettingsUpdate } from '../models/TownSettingsUpdate';
import type { ViewingArea } from '../models/ViewingArea';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TownsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * List all towns that are set to be publicly available
     * @returns Town list of towns
     * @throws ApiError
     */
    public listTowns(): CancelablePromise<Array<Town>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/towns',
        });
    }

    /**
     * Create a new town
     * @param requestBody The public-facing information for the new town
     * @returns TownCreateResponse The ID of the newly created town, and a secret password that will be needed to update or delete this town.
     * @throws ApiError
     */
    public createTown(
requestBody: TownCreateParams,
): CancelablePromise<TownCreateResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Updates an existing town's settings by ID
     * @param townId town to update
     * @param xCoveyTownPassword town update password, must match the password returned by createTown
     * @param requestBody The updated settings
     * @returns void 
     * @throws ApiError
     */
    public updateTown(
townId: string,
xCoveyTownPassword: string,
requestBody: TownSettingsUpdate,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}',
            path: {
                'townID': townId,
            },
            headers: {
                'X-CoveyTown-Password': xCoveyTownPassword,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid password or update values specified`,
            },
        });
    }

    /**
     * Deletes a town
     * @param townId ID of the town to delete
     * @param xCoveyTownPassword town update password, must match the password returned by createTown
     * @returns void 
     * @throws ApiError
     */
    public deleteTown(
townId: string,
xCoveyTownPassword: string,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/towns/{townID}',
            path: {
                'townID': townId,
            },
            headers: {
                'X-CoveyTown-Password': xCoveyTownPassword,
            },
            errors: {
                400: `Invalid password or update values specified`,
            },
        });
    }

    /**
     * Creates a conversation area in a given town
     * @param townId ID of the town in which to create the new conversation area
     * @param xSessionToken session token of the player making the request, must match the session token returned when the player joined the town
     * @param requestBody The new conversation area to create
     * @returns void 
     * @throws ApiError
     */
    public createConversationArea(
townId: string,
xSessionToken: string,
requestBody: ConversationArea,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/conversationArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a viewing area in a given town
     * @param townId ID of the town in which to create the new viewing area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @param requestBody The new viewing area to create
     * @returns void 
     * @throws ApiError
     */
    public createViewingArea(
townId: string,
xSessionToken: string,
requestBody: ViewingArea,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/viewingArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a poster session area in a given town
     * @param townId ID of the town in which to create the new poster session area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @param requestBody The new poster session area to create
     * @returns void 
     * @throws ApiError
     */
    public createPosterSessionArea(
townId: string,
xSessionToken: string,
requestBody: PosterSessionArea,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/posterSessionArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * @param townId 
     * @param xSessionToken 
     * @param requestBody 
     * @returns void 
     * @throws ApiError
     */
    public createBattleshipArea(
townId: string,
xSessionToken: string,
requestBody: BattleshipArea,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/battleshipArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Gets the image contents of a given poster session area in a given town
     * @param townId ID of the town in which to get the poster session area image contents
     * @param posterSessionId interactable ID of the poster session
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns string Ok
     * @throws ApiError
     */
    public getPosterAreaImageContents(
townId: string,
posterSessionId: string,
xSessionToken: string,
): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{posterSessionId}/imageContents',
            path: {
                'townID': townId,
                'posterSessionId': posterSessionId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Increment the stars of a given poster session area in a given town, as long as there is
 * a poster image. Returns the new number of stars.
     * @param townId ID of the town in which to get the poster session area image contents
     * @param posterSessionId interactable ID of the poster session
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns number Ok
     * @throws ApiError
     */
    public incrementPosterAreaStars(
townId: string,
posterSessionId: string,
xSessionToken: string,
): CancelablePromise<number> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{posterSessionId}/incStars',
            path: {
                'townID': townId,
                'posterSessionId': posterSessionId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * API call to join game
 * redesigned bc updateModel will not work w our game
 * shipSetups cannot be in the recreated model bc it will be sent
 * through CoveyTownSocket, aka it will be public to players
 * only joins a game after the player has created their setup board
 * and submitted it.
 * The first two players to submit will automatically join a game
 * If any additional player tries to submit a board, it will error
 * saying two people are already in a game
     * @param townId ID of the town
     * @param battleshipId Battleship Area ID
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @param playerId ID of the player
     * @param requestBody gameboard setup a player submits to join the game
     * @returns GameInfo a GameInfo of a player
     * @throws ApiError
     */
    public joinGame(
townId: string,
battleshipId: string,
xSessionToken: string,
playerId: string,
requestBody: Array<Array<string>>,
): CancelablePromise<GameInfo> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{battleshipID}/joinGame',
            path: {
                'townID': townId,
                'battleshipID': battleshipId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
                'playerID': playerId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * API call to submit a valid move for players
     * @param townId ID of the town
     * @param battleshipId Battleship Area ID
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @param playerId ID of the player
     * @param requestBody a battleship move, which consists of a row number and
 * a column number that the player wants to hit
     * @returns GameInfo a GameInfo of a player
     * @throws ApiError
     */
    public submitMove(
townId: string,
battleshipId: string,
xSessionToken: string,
playerId: string,
requestBody: BattleshipMove,
): CancelablePromise<GameInfo> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{battleshipID}/submitMove',
            path: {
                'townID': townId,
                'battleshipID': battleshipId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
                'playerID': playerId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * API call to reset game after closing a battleship game
     * @param townId ID of the town
     * @param battleshipId Battleship Area ID
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @param playerId ID of the player
     * @returns void 
     * @throws ApiError
     */
    public leaveGame(
townId: string,
battleshipId: string,
xSessionToken: string,
playerId: string,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{battleshipID}/leaveGame',
            path: {
                'townID': townId,
                'battleshipID': battleshipId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
                'playerID': playerId,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

}
