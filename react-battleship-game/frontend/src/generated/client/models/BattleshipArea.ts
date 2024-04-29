/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GameInfo } from './GameInfo';

export type BattleshipArea = {
    id: string;
    turn: string;
    gameState: string;
    battleshipSetups: Record<string, Array<Array<string>>>;
    battleshipGuessedBoards: Record<string, GameInfo>;
};
