import { EventEmitter } from 'events';
import { useEffect, useState } from 'react';
import TypedEventEmitter from 'typed-emitter';
import {
  BattleshipArea as BattleshipAreaModel,
  GameInfo,
} from '../types/CoveyTownSocket';

export type BattleshipAreaEvents = {
  /**
   * A turnChange event indicates that the a player has went and it is the other player's turn.
   * Listeners are passed the new state in new turn.
   */
  turnChange: (turn: string) => void;
  /**
   * A gameStateChange event indicates that state of the game is changing.
   * Listeners are passed the current gameState.
   */
  gameStateChange: (gameState: string) => void;
  /**
   * A battleshipSetupsChange event indicates that the state of the battleshipSetups has changed.
   * Listeners are passed the new state in new battleshipSetups.
   */
  battleshipSetupsChange: (battleShipSetups: { [index: string]: string[][] }) => void;
  /**
   * A battleshipGuessedBoardsChange event indicates that the state of the battleshipGuessedBoards has changed.
   * Listeners are passed the new state in new battleshipGuessedBoards.
   */
  battleshipGuessedBoardsChange: (battleShipGuessedBoards: { [index: string]: GameInfo }) => void;
};

export default class BattleshipAreaController extends (EventEmitter as new () => TypedEventEmitter<BattleshipAreaEvents>) {
  public _model: BattleshipAreaModel;

  private _readyState: boolean;

  /**
   * Constructs a new BattleshipAreaController, initialized with the state of the
   * provided BattleshipAreaModel.
   *
   * @param battleshipAreaModel The battleship area model that this controller should represent
   */
  constructor(battleshipAreaModel: BattleshipAreaModel) {
    super();
    this._model = battleshipAreaModel;
    this._readyState = false;
  }

  public get id(): string {
    return this._model.id;
  }

  public get turn(): string {
    return this._model.turn;
  }

  public set turn(turn: string) {
    if (this._model.turn !== turn) {
      this._model.turn = turn;
      this.emit('turnChange', turn);
    }
  }

  public get battleshipSetups(): { [index: string]: string[][] } {
    return this._model.battleshipSetups;
  }

  public set battleshipSetups(setups: { [index: string]: string[][] }) {
    if (this._model.battleshipSetups !== setups) {
      this._model.battleshipSetups = setups;
      this.emit('battleshipSetupsChange', setups);
    }
  }

  public get battleshipGuessedBoards(): { [index: string]: GameInfo } {
    return this._model.battleshipGuessedBoards;
  }

  public set battleshipGuessedBoards(boards: { [index: string]: GameInfo }) {
    if (this._model.battleshipGuessedBoards !== boards) {
      this._model.battleshipGuessedBoards = boards;
      this.emit('battleshipGuessedBoardsChange', boards);
    }
  }

  /**
   * The current GameState of the game in this area.
   */
  public get gameState(): string {
    return this._model.gameState;
  }

  /**
   * The current gameState of the game assigned to this area.
   *
   * Changing this value will emit a gameStateChange event to listeners
   */
  public set gameState(gameState: string) {
    if (this._model.gameState !== gameState) {
      this._model.gameState = gameState;
      this.emit('gameStateChange', gameState);
    }
  }

  public get readyState(): boolean {
    return this._readyState;
  }

  /**
   * @returns BattleshipAreaModel that represents the current state of this BattleshipAreaController
   */
  public battleshipAreaModel(): BattleshipAreaModel {
    return this._model;
  }

  /**
   * Applies updates to this battleship area controller's model, setting the fields
   * gameboard, turn, and gameState from the updatedModel
   *
   * @param updatedModel
   */
  public updateFrom(updatedModel: BattleshipAreaModel): void {
    console.log('BEGINNING OF UPDATE FROM FUNCTION');
    this.turn = updatedModel.turn;

    console.log('UPDATE FUNCTION LINE 127');
    this.gameState = updatedModel.gameState;

    console.log('UPDATE FUNCTION LINE 129');
    this.battleshipSetups = updatedModel.battleshipSetups;

    console.log('UPDATE FUNCTION LINE 133');

    this.battleshipGuessedBoards = updatedModel.battleshipGuessedBoards;
    console.log('UPDATE FROM BATTLESHIP AREA CONTROLLER MODEL', this._model);
    console.log('UPDATE FROM BATTLESHIP AREA CONTROLLER MODEL GUESSED BOARDS', this.battleshipGuessedBoards);
    console.log('UPDATE FROM BATTLESHIP AREA CONTROLLER MODEL SETUPS', this.battleshipSetups);
  }
}

/**
 * A hook that returns the battleshipSetups of the battleship area with the given controller
 */
export function useBattleShipSetup(controller: BattleshipAreaController): {
  [index: string]: string[][];
} {
  const [battleShipSetup, setBattleShipSetups] = useState(controller.battleshipSetups);
  useEffect(() => {
    console.log('BATTLESHIP AREA CONTROLLER USEBATTLESHIPSETUP', controller.battleshipSetups);
    controller.addListener('battleshipSetupsChange', setBattleShipSetups);
    return () => {
      controller.removeListener('battleshipSetupsChange', setBattleShipSetups);
    };
  }, [controller]);
  return battleShipSetup;
}

/**
 * A hook that returns the battleshipGuessedBoards of the battleship area with the given controller
 */
export function useBattleshipGuessedBoards(controller: BattleshipAreaController): {
  [index: string]: GameInfo,
} {
  const [battleShipGuessedBoards, setBattleShipGuessedBoards] = useState(
    controller.battleshipGuessedBoards,
  );
  useEffect(() => {
    console.log('BATTLESHIP AREA CONTROLLER USEBATTLESHIP GUESSEDBOARD', controller.battleshipGuessedBoards);
    controller.addListener('battleshipGuessedBoardsChange', setBattleShipGuessedBoards);
    return () => {
      controller.removeListener('battleshipGuessedBoardsChange', setBattleShipGuessedBoards);
    };
  }, [controller]);
  return battleShipGuessedBoards;
}

/**
 * A hook that returns the current turn for the battleship area with the given controller
 */
export function useTurn(controller: BattleshipAreaController): string {
  const [turn, setTurns] = useState(controller.turn);
  useEffect(() => {

    controller.addListener('turnChange', setTurns);
    return () => {
      controller.removeListener('turnChange', setTurns);
    };
  }, [controller]);
  return turn;
}

/**
 * A hook that returns the gameState for the battleship area with the given controller
 */
export function useGameState(controller: BattleshipAreaController): string {
  const [gameState, setGameState] = useState(controller.gameState);
  useEffect(() => {
    console.log('BATTLESHIP AREA CONTROLLER USEGAMESTATE');
    controller.addListener('gameStateChange', setGameState);
    return () => {
      controller.removeListener('gameStateChange', setGameState);
    };
  }, [controller]);
  return gameState;
}
