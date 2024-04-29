import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { readFileSync } from 'fs';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter } from '../types/CoveyTownSocket';
import BattleshipArea from './BattleshipArea';

describe('BattleshipArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: BattleshipArea;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  let firstPlayer: Player;
  let secondPlayer: Player;
  const id = nanoid();
  const turn = '';
  const gameState = 'setup';
  let battleshipGuessedBoards = {};
  let battleshipSetups = {};
  const firstPlayerSetup = [
    ['S5', '', 'S1', 'S1', '', '', ''],
    ['S5', '', '', '', '', 'S3', ''],
    ['S5', '', '', '', '', 'S3', ''],
    ['S5', '', '', '', '', 'S3', ''],
    ['', '', '', 'S2', 'S2', '', ''],
    ['', '', '', '', '', '', ''],
    ['', 'S4', 'S4', 'S4', '', '', ''],
  ];
  const secondPlayerSetup = [
    ['', 'S1', '', '', '', 'S5', ''],
    ['', 'S1', '', '', '', 'S5', ''],
    ['', '', '', '', '', 'S5', ''],
    ['', 'S4', '', '', '', 'S5', 'S3'],
    ['', 'S4', '', '', '', '', 'S3'],
    ['', 'S4', '', '', '', '', 'S3'],
    ['', 'S2', 'S2', '', '', '', ''],
  ];
  const emptyBoard = [
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
  ];

  beforeEach(() => {
    mockClear(townEmitter);
    battleshipGuessedBoards = {};
    battleshipSetups = {};
    testArea = new BattleshipArea(
      { id, turn, gameState, battleshipGuessedBoards, battleshipSetups },
      testAreaBox,
      townEmitter,
    );
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
    firstPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(firstPlayer);
    secondPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(secondPlayer);
    testArea.addPlayer(firstPlayer.id, firstPlayerSetup);
    testArea.addPlayer(secondPlayer.id, secondPlayerSetup);
  });
  describe('Remove', () => {
    it('Removes players from the list of occupants', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);
      testArea.remove(firstPlayer);
      testArea.remove(secondPlayer);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        turn: '',
        gameState: 'setup',
        battleshipGuessedBoards: {},
        battleshipSetups: {},
      });
      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
    });
    it("Clears the player's interactableID and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Update turn, gameState, battleshipGuessedBoards, and battleshipSetups to empty when the last occupant leaves', () => {
      testArea.remove(newPlayer);
      testArea.remove(firstPlayer);
      testArea.remove(secondPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        turn: '',
        gameState: 'setup',
        battleshipGuessedBoards: {},
        battleshipSetups: {},
      });
      expect(testArea.turn).toEqual('');
      expect(testArea.gameState).toEqual('setup');
      expect(testArea.battleshipGuessedBoards).toEqual({});
      expect(testArea.battleshipSetups).toEqual({});
    });
  });
  describe('add', () => {
    it('Adds the player to the occupants list', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id, firstPlayer.id, secondPlayer.id]);
    });
    it("Sets the player's interactableID and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  test('toModel: toModel sets the ID, turn, gameState, battleshipGuessedBoards, battleshipSetups', () => {
    testArea.remove(firstPlayer);
    testArea.remove(secondPlayer);
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      turn: '',
      gameState: 'setup',
      battleshipGuessedBoards: {},
      battleshipSetups: {},
    });
  });
  test('updateModel: updateModel sets turn, gameState, battleshipGuessedBoards, battleshipSetups', () => {
    const newId = 'test';
    const newTurn = '235324';
    const newGameState = 'setup';
    const newBattleshipGuessedBoards = {};
    const newBattleshipSetups = {};
    testArea.updateModel({
      id: newId,
      turn: newTurn,
      gameState: newGameState,
      battleshipGuessedBoards: newBattleshipGuessedBoards,
      battleshipSetups: newBattleshipSetups,
    });
    expect(testArea.id).toBe(id);
    expect(testArea.turn).toBe(newTurn);
    expect(testArea.gameState).toBe(newGameState);
    expect(testArea.battleshipGuessedBoards).toBe(newBattleshipGuessedBoards);
    expect(testArea.battleshipSetups).toBe(newBattleshipSetups);
  });
  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        BattleshipArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new battleship area using the provided boundingBox and id, with initial values, and emitter', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = BattleshipArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.turn).toEqual('');
      expect(val.gameState).toEqual('setup');
      expect(val.battleshipGuessedBoards).toEqual({});
      expect(val.battleshipSetups).toEqual({});
      expect(val.occupantsByID).toEqual([]);
    });
  });
  describe('abort game', () => {
    it('aborts and ends the game for all players, resets all fields', () => {
      testArea.abortGame();
      expect(testArea.turn).toEqual('');
      expect(testArea.gameState).toEqual('setup');
      expect(testArea.battleshipGuessedBoards).toEqual({});
      expect(testArea.battleshipSetups).toEqual({});
    });
  });
  describe('addPlayer', () => {
    it('adding a player to the battleship game and initializes the game with their setup', () => {
      const model = testArea.toModel();
      expect(firstPlayer.id in model.battleshipGuessedBoards).toBeTruthy();
      expect(secondPlayer.id in model.battleshipGuessedBoards).toBeTruthy();
      expect(firstPlayer.id in model.battleshipSetups).toBeTruthy();
      expect(secondPlayer.id in model.battleshipSetups).toBeTruthy();
      expect(testArea.gameState).toEqual('playing');
      expect(testArea.turn).toEqual(secondPlayer.id);
      expect(testArea.battleshipGuessedBoards[firstPlayer.id].board).toEqual(emptyBoard);
      expect(testArea.battleshipGuessedBoards[secondPlayer.id].board).toEqual(emptyBoard);
    });
  });
  describe('handleMove', () => {
    it('handle move for a hit', () => {
      testArea.handleMove(secondPlayer.id, { row: 4, col: 4 });
      expect(testArea.battleshipGuessedBoards[secondPlayer.id].board).toEqual([
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', 'h', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
      ]);
    });
    it('handle move for a miss', () => {
      testArea.handleMove(secondPlayer.id, { row: 4, col: 5 });
      expect(testArea.battleshipGuessedBoards[secondPlayer.id].board).toEqual([
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', 'm', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
      ]);
    });
    it('handle move for sunk ship', () => {
      testArea.handleMove(secondPlayer.id, { row: 5, col: 3 });
      testArea.handleMove(firstPlayer.id, { row: 0, col: 1 });
      testArea.handleMove(secondPlayer.id, { row: 6, col: 2 });
      testArea.handleMove(firstPlayer.id, { row: 1, col: 1 });
      expect(testArea.battleshipGuessedBoards[firstPlayer.id].board).toEqual([
        ['', 'k', '', '', '', '', ''],
        ['', 'k', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
      ]);
    });
    it('handle move for game over/win', () => {
      testArea.handleMove(secondPlayer.id, { row: 0, col: 0 });
      testArea.handleMove(firstPlayer.id, { row: 0, col: 1 });
      testArea.handleMove(secondPlayer.id, { row: 0, col: 1 });
      testArea.handleMove(firstPlayer.id, { row: 1, col: 1 }); // sunk S1
      testArea.handleMove(secondPlayer.id, { row: 0, col: 2 });
      testArea.handleMove(firstPlayer.id, { row: 3, col: 1 });
      testArea.handleMove(secondPlayer.id, { row: 0, col: 3 });
      testArea.handleMove(firstPlayer.id, { row: 4, col: 1 });
      testArea.handleMove(secondPlayer.id, { row: 0, col: 4 });
      testArea.handleMove(firstPlayer.id, { row: 5, col: 1 }); // sunk S4
      testArea.handleMove(secondPlayer.id, { row: 0, col: 5 });
      testArea.handleMove(firstPlayer.id, { row: 6, col: 1 });
      testArea.handleMove(secondPlayer.id, { row: 0, col: 6 });
      testArea.handleMove(firstPlayer.id, { row: 6, col: 2 }); // sunk S2
      testArea.handleMove(secondPlayer.id, { row: 1, col: 0 });
      testArea.handleMove(firstPlayer.id, { row: 0, col: 5 });
      testArea.handleMove(secondPlayer.id, { row: 1, col: 1 });
      testArea.handleMove(firstPlayer.id, { row: 1, col: 5 });
      testArea.handleMove(secondPlayer.id, { row: 1, col: 2 });
      testArea.handleMove(firstPlayer.id, { row: 2, col: 5 });
      testArea.handleMove(secondPlayer.id, { row: 1, col: 3 });
      testArea.handleMove(firstPlayer.id, { row: 3, col: 5 }); // sunk S5
      testArea.handleMove(secondPlayer.id, { row: 1, col: 4 });
      testArea.handleMove(firstPlayer.id, { row: 3, col: 6 });
      testArea.handleMove(secondPlayer.id, { row: 1, col: 5 });
      testArea.handleMove(firstPlayer.id, { row: 4, col: 6 });
      testArea.handleMove(secondPlayer.id, { row: 1, col: 6 });
      testArea.handleMove(firstPlayer.id, { row: 5, col: 6 }); // sunk S3, first player win
      expect(testArea.battleshipGuessedBoards[firstPlayer.id].shipsSunk).toEqual(5);
      expect(testArea.gameState).toEqual('over');
    });
  });
});
