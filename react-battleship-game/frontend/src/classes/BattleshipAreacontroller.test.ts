import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { BattleshipArea, GameState } from '../types/CoveyTownSocket';
import BattleshipAreaController, { BattleshipAreaEvents } from './BattleshipAreaController';
import TownController from './TownController';

describe('BattleshipAreaController', () => {
  // A valid BattleshipArea to be reused within the tests
  let testArea: BattleshipAreaController;
  let testAreaModel: BattleshipArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<BattleshipAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      gameState: 'setup' as const,
      turn: '',
      battleshipSetups: {},
      battleshipGuessedBoards: {},
    };
    testArea = new BattleshipAreaController(testAreaModel);
    mockClear(townController);
    mockClear(mockListeners.gameStateChange);
    mockClear(mockListeners.battleshipGuessedBoardsChange);
    mockClear(mockListeners.battleshipSetupsChange);
    mockClear(mockListeners.turnChange);
    testArea.addListener('gameStateChange', mockListeners.gameStateChange);
    testArea.addListener('battleshipSetupsChange', mockListeners.battleshipSetupsChange);
    testArea.addListener('turnChange', mockListeners.turnChange);
    testArea.addListener(
      'battleshipGuessedBoardsChange',
      mockListeners.battleshipGuessedBoardsChange,
    );
  });
  describe('Setting gameState property', () => {
    it('updates the property and emits a gameStateChange event if the property changes', () => {
      const newGameState = 'over';
      testArea.gameState = newGameState;
      expect(mockListeners.gameStateChange).toBeCalledWith(newGameState);
      expect(testArea.gameState).toEqual(newGameState);
    });
    it('does not emit a gameStateChange event if the gameState property does not change', () => {
      testArea.gameState = testAreaModel.gameState as GameState;
      expect(mockListeners.gameStateChange).not.toBeCalled();
    });
  });

  describe('Setting turn property', () => {
    it('updates the property and emits a turnChange event if the property changes', () => {
      const newTurn = nanoid();
      testArea.turn = newTurn;
      expect(mockListeners.turnChange).toBeCalledWith(newTurn);
      expect(testArea.turn).toEqual(newTurn);
    });
    it('does not emit a turnChange event if the turn property does not change', () => {
      testArea.turn = testAreaModel.turn;
      expect(mockListeners.turnChange).not.toBeCalled();
    });
  });

  describe('Setting battleshipSetups property', () => {
    it('updates the property and emits a battleshipSetupsChange event if the property changes', () => {
      const newBattleshipSetups = { test: [['']] };
      testArea.battleshipSetups = newBattleshipSetups;
      expect(mockListeners.battleshipSetupsChange).toBeCalledWith(newBattleshipSetups);
      expect(testArea.battleshipSetups).toEqual(newBattleshipSetups);
    });
    it('does not emit a battleshipSetupsChange event if the battleshipSetups property does not change', () => {
      testArea.battleshipSetups = testAreaModel.battleshipSetups;
      expect(mockListeners.battleshipSetupsChange).not.toBeCalled();
    });
  });

  describe('Setting battleshipGuessedBoards property', () => {
    it('updates the property and emits a battleshipGuessedBoardsChange event if the property changes', () => {
      const newBattleshipGuessedBoards = { test1: { board: [['']], shipsSunk: 0 } };
      testArea.battleshipGuessedBoards = newBattleshipGuessedBoards;
      expect(mockListeners.battleshipGuessedBoardsChange).toBeCalledWith(
        newBattleshipGuessedBoards,
      );
      expect(testArea.battleshipGuessedBoards).toEqual(newBattleshipGuessedBoards);
    });
    it('does not emit a battleshipGuessedBoardsChange event if the battleshipGuessedBoards property does not change', () => {
      testArea.battleshipGuessedBoards = testAreaModel.battleshipGuessedBoards;
      expect(mockListeners.battleshipGuessedBoardsChange).not.toBeCalled();
    });
  });

  describe('BattleShipAreaModel', () => {
    it('Carries through all of the properties', () => {
      const model = testArea.battleshipAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });

  describe('UpdateFrom new model', () => {
    it('updates the gameState, turn, battleshipSetups, battleshipGuessedboards properties if the model changes', () => {
      const newGameState = 'over';
      const newTurn = nanoid();
      const newBattleshipSetups = { test: [['']] };
      const newBattleshipGuessedBoards = { test1: { board: [['']], shipsSunk: 0 } };
      const newModel = {
        id: nanoid(),
        gameState: newGameState,
        turn: newTurn,
        battleshipSetups: newBattleshipSetups,
        battleshipGuessedBoards: newBattleshipGuessedBoards,
      };
      testArea.updateFrom(newModel);
      expect(testArea.gameState).toEqual(newGameState);
      expect(testArea.turn).toEqual(newTurn);
      expect(testArea.battleshipSetups).toEqual(newBattleshipSetups);
      expect(testArea.battleshipGuessedBoards).toEqual(newBattleshipGuessedBoards);
      expect(mockListeners.gameStateChange).toBeCalledWith(newGameState);
      expect(mockListeners.turnChange).toBeCalledWith(newTurn);
      expect(mockListeners.battleshipSetupsChange).toBeCalledWith(newBattleshipSetups);
      expect(mockListeners.battleshipGuessedBoardsChange).toBeCalledWith(
        newBattleshipGuessedBoards,
      );
    });
  });
});
