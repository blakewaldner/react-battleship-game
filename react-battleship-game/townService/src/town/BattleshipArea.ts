import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import InteractableArea from './InteractableArea';
import {
  GameInfo,
  BattleshipArea as BattleshipAreaModel,
  BoundingBox,
  TownEmitter,
  BattleshipMove,
} from '../types/CoveyTownSocket';
import InvalidParametersError from '../lib/InvalidParametersError';

const BOARD_SIZE = 7;
const SHIP_COUNT = 5;

export default class BattleshipArea extends InteractableArea {
  private _turn: string;

  private _gameState: string;

  // represents a player, and the board they are guessing
  // i.e. player 1: player 2's hidden board, player 2: player 1's hidden board
  private _battleshipGuessedBoards: { [index: string]: GameInfo };

  // player: their ship setup, will be kept private on the server
  private _battleshipSetups: { [index: string]: string[][] };

  public get turn() {
    return this._turn;
  }

  public get gameState() {
    return this._gameState;
  }

  public get battleshipGuessedBoards() {
    return this._battleshipGuessedBoards;
  }

  public get battleshipSetups() {
    return this._battleshipSetups;
  }

  /**
   * Creates a new BattleshipArea
   *
   * @param BattleshipArea model containing this area's starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, turn, gameState, battleshipGuessedBoards, battleshipSetups }: BattleshipAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._turn = turn;
    this._gameState = gameState;
    this._battleshipGuessedBoards = battleshipGuessedBoards;
    this._battleshipSetups = battleshipSetups;
  }

  /**
   * Aborts the battleship game and resets the game
   */
  public abortGame(): void {
    this._turn = '';
    this._gameState = 'setup';
    this._battleshipGuessedBoards = {};
    this._battleshipSetups = {};
  }

  /**
   * Removes a player from this Battleship area.
   *
   * When the last player leaves, this method returns the gameboard to an empty 2D array, places the turn back to Player 1, and sets gameState to setup
   *
   * @param player player
   */
  public remove(player: Player): void {
    super.remove(player);
    if (player.id in this._battleshipSetups) {
      this.abortGame();
      this._emitAreaChanged();
    }
  }

  /**
   * Updates the state of this BattleshipArea, setting the turn, gameState, guessed boards, and setup properties
   *
   * @param updatedModel updated model
   */
  public updateModel(updatedModel: BattleshipAreaModel) {
    this._turn = updatedModel.turn;
    this._gameState = updatedModel.gameState;
    this._battleshipGuessedBoards = updatedModel.battleshipGuessedBoards;
    this._battleshipSetups = updatedModel.battleshipSetups;
  }

  /**
   * Add players and their game boards to battleshipGuessedBoards and
   * battleshipSetups when the game begins
   * @param playerID the player's ID
   * @param setup submitted setup from player
   */
  public addPlayer(playerID: string, setup: string[][]) {
    this._battleshipSetups[playerID] = setup;
    const initialBoard: string[][] = [
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
    ];
    this._battleshipGuessedBoards[playerID] = {
      board: initialBoard,
      shipsSunk: 0,
    };
    if (Object.keys(this._battleshipGuessedBoards).length === 2) {
      this._gameState = 'playing' as const;
      this._turn = playerID;
    }
    this._emitAreaChanged();
  }

  /**
   * Handles each move made by players by checking if it is a hit or miss and marks the boards accordingly,
   * then checks if there is a winner after making the move
   * @param playerID the player's ID
   * @param requestBody row and column of a player's move
   * @returns error if all other checks fail
   */
  public handleMove(playerID: string, requestBody: BattleshipMove) {
    // make sure there is a game happening
    if (this.gameState !== 'playing') {
      throw new InvalidParametersError('Not in a game');
    }
    // validate it's their turn
    if (this.turn !== playerID) {
      throw new InvalidParametersError('Not the correct player turn');
    }
    // validate that the move is actually valid
    // (within the boudns of the gameboard and hasn't been already hit before)
    const co = requestBody.col;
    const ro = requestBody.row;
    if (co > BOARD_SIZE || co < 0 || ro > BOARD_SIZE || ro < 0) {
      throw new InvalidParametersError('Board out of bounds');
    }
    if (this.battleshipGuessedBoards[playerID].board[ro][co] !== '') {
      throw new InvalidParametersError('Tried to hit an already guessed cell');
    }
    // check if the hit is actually a hit or a miss against their opponent's ship setup
    // update their own board accordingly based on the hit/miss
    const currPlayerBoard = this.battleshipGuessedBoards[playerID].board;
    for (const oppID in this.battleshipGuessedBoards) {
      if (oppID !== playerID) {
        const target = this.battleshipSetups[oppID];
        const shipName = target[ro][co];
        if (shipName.startsWith('S')) {
          currPlayerBoard[ro][co] = 'h';
          // grab the ship # that was hit (e.g. S1)
          // then, check if all other S1s are hit
          let sunk = true;
          for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
              if (target[i][j] === shipName && currPlayerBoard[i][j] !== 'h') {
                sunk = false;
                break;
              }
            }
            if (!sunk) {
              break;
            }
          }
          // if sunk, incr ship count, change all S1 'h's into 'k's
          if (sunk) {
            this.battleshipGuessedBoards[playerID].shipsSunk += 1;
            for (let i = 0; i < BOARD_SIZE; i++) {
              for (let j = 0; j < BOARD_SIZE; j++) {
                if (target[i][j] === shipName) {
                  currPlayerBoard[i][j] = 'k';
                }
              }
            }
            // check if there is a winner yet
            if (this.battleshipGuessedBoards[playerID].shipsSunk === SHIP_COUNT) {
              this._gameState = 'over';
            }
          }
          // missed/hit water
        } else if (shipName === '') {
          currPlayerBoard[ro][co] = 'm';
        }
        this._turn = oppID;
        this._emitAreaChanged();
        return;
      }
    }
    throw new InvalidParametersError('Something went horribly wrong');
  }

  /**
   * Convert this BattleshipArea instance to a simple BattleshipAreaModel suitable for
   * transporting over a socket to a client (i.e., serializable).
   */
  public toModel(): BattleshipAreaModel {
    return {
      id: this.id,
      turn: this._turn,
      gameState: this._gameState,
      battleshipSetups: this._battleshipSetups,
      battleshipGuessedBoards: this._battleshipGuessedBoards,
    };
  }

  /**
   * Creates a new BattleshipArea object that will represent a BattleshipArea object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    townEmitter: TownEmitter,
  ): BattleshipArea {
    if (!mapObject.width || !mapObject.height) {
      throw new Error('missing width/height for map object');
    }
    const box = {
      x: mapObject.x,
      y: mapObject.y,
      width: mapObject.width,
      height: mapObject.height,
    };
    return new BattleshipArea(
      {
        id: mapObject.name,
        turn: '',
        gameState: 'setup',
        battleshipSetups: {},
        battleshipGuessedBoards: {},
      },
      box,
      townEmitter,
    );
  }
}
