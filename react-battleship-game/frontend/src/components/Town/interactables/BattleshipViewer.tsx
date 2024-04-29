/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { useInteractable, useBattleshipAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import BattleshipAreaInteractable from './BattleshipArea';
import '../../Battleship/BattleshipViewer.css';
import { BattleshipGrid } from '../../Battleship/BattleshipGrid';
import { BattleshipSidebar } from '../../Battleship/sidebar/Sidebar';
import { BattleshipArea as BattleshipAreaModel } from '../../../types/CoveyTownSocket';
import BattleshipArea from './BattleshipArea';
import { useBattleShipSetup, useBattleshipGuessedBoards, useGameState, useTurn } from '../../../classes/BattleshipAreaController';


export function BattleshipGridWrapper({
  isOpen,
  close,
  gameboard,
  battleshipArea,
}: {
  isOpen: boolean;
  close: () => void;
  gameboard: string[][];
  battleshipArea: BattleshipArea
}): JSX.Element {
  const townController = useTownController();
  const battleshipAreaController = useBattleshipAreaController(battleshipArea.id);
  const [gridCoordinate, setgridCoordinate] = useState({ x: -1, y: -1 });
  const [selection, setSelection] = useState({ length: 0, direction: '', id: -1 });
  const [entries, setEntries] = useState([
    { id: 1, length: 2 },
    { id: 2, length: 2 },
    { id: 3, length: 3 },
    { id: 4, length: 3 },
    { id: 5, length: 4 },
  ]);
  const [guess, setGuess] = useState({row: 0, col: 0});

  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const gameState = useGameState(battleshipAreaController);
  const setupBoard = useBattleShipSetup(battleshipAreaController);
  const guessedBoards = useBattleshipGuessedBoards(battleshipAreaController);
  const turn = useTurn(battleshipAreaController);

  useEffect(() => {
    townController.getBattleshipAreaController(battleshipArea);
  }, [townController, battleshipAreaController,battleshipArea]);

  function handleSidebarClick(len: number, direction: string, id: number) {
    const temp = { length: len, direction: direction, id: id };
    setSelection(temp);
    setgridCoordinate({ x: -1, y: -1 });
  }

  function getOtherPlayerId(){
    const keys = Object.keys(battleshipAreaController._model.battleshipGuessedBoards);
    for(let i = 0; i < keys.length; i ++){
      if(keys[i]!= townController.ourPlayer.id){
        return keys[i];
      }
    }
    return 'error';
  }

  function validClick(len: number, direction: string, x: number, y: number) {
    for (let i = 0; i < selection.length; i++) {
      if (selection.direction == 'H') {
        if (x + i > 6 || gameboard[y][x + i].includes('S')) {
          return false;
        }
      } else {
        if (y + i > 6 || gameboard[y + i][x].includes('S')) {
          return false;
        }
      }
    }
    return true;
  }
  function handleGridClick(x: number, y: number) {
    if (selection.length > 0 && validClick(selection.length, selection.direction, x, y)) {
      for (let i = 0; i < selection.length; i++) {
        if (selection.direction == 'H') {
          gameboard[y][x + i] = 'S' + selection.id;
        } else {
          gameboard[y + i][x] = 'S' + selection.id;
        }
      }
      const temp = [];
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].id != selection.id) {
          temp.push(entries[i]);
        }
      }
      setEntries(temp);
      setgridCoordinate({ x: -1, y: -1 });
      setSelection({ length: 0, direction: '', id: -1 });
    }
  }
  const toast = useToast();

  const createBattleshipArea = useCallback(async () => {      
      try {
        await townController.joinBattleshipGame(battleshipAreaController,gameboard);
        toast({
          title: 'Battleship Created!',
          status: 'success',
        }
        );
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create battleship',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
  },[battleshipAreaController,gameboard,toast,townController]);

  const sendGuess = async () => {
      try {
        await townController.submitMove(battleshipAreaController,guess);
        toast({
          title: 'Move sent!',
          status: 'success',
        }
        );
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to send move',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
  };

  function handleGridGuess(x:number, y:number){
    setGuess({row: y,col: x});
  }

  function appendTwoBoards(board1: string[][], board2: string[][]){
    const temp = [
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
    ];
    for(let i = 0; i < temp.length; i ++){
      for(let j = 0; j < temp.length; j ++){
        temp[i][j] = (board1[i][j]+board2[i][j]).toUpperCase();
      }
    }
    return temp;
  }

  if(Object.keys(guessedBoards).length < 2){
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          close();
          townController.unPause();
        }}
        size='2xl'>
        <ModalOverlay> </ModalOverlay>
        <ModalContent>
          <ModalBody>
          <ModalHeader>Setup - Choose your battleship locations</ModalHeader>
          <div className='modalContent'>
            <BattleshipGrid
              width={7}
              height={7}
              gameboard={gameboard}
              handleClick={handleGridClick}
            />
            <BattleshipSidebar entries={entries} handleClick={handleSidebarClick} />
            <Button onClick={createBattleshipArea}>READY</Button>
            </div>
          <ModalCloseButton />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  else if(Object.keys(guessedBoards).length == 2 && gameState == 'playing'){
    return(
      <Modal
        isOpen={isOpen}
        onClose={() => {
          close();
          townController.unPause();
        }}
        size='2xl'>
        <ModalOverlay> </ModalOverlay>
        <ModalContent>
        <ModalBody>
        <ModalHeader>Playing Game</ModalHeader>
        {(turn == townController.ourPlayer.id) ? (
          <div className='playingGrid'>
            <div className='playingGridSubtitle'>
              <div>
              {'Your turn'}
              </div>
              <div>
              {'Guess: x: ' + guess.col + ' y: ' + guess.row}
              </div>
            </div>
            <div className='playingGridRow'>
          <BattleshipGrid
              width={7}
              height={7}
              gameboard={appendTwoBoards(setupBoard[townController.ourPlayer.id],
                guessedBoards[getOtherPlayerId()].board)
              }
              handleClick={()=>{}}
            />
            <BattleshipGrid 
              width={7}
              height={7}
              gameboard={appendTwoBoards(guessedBoards[townController.ourPlayer.id].board,
                guessedBoards[townController.ourPlayer.id].board)}
              handleClick={handleGridGuess}
            />
            </div>
            <Button onClick={sendGuess}>Send guess</Button>
          </div>
      ) : (
        <div>
           Other player&apos;s turn
          <div className='playingGridRow'>
          <BattleshipGrid
              width={7}
              height={7}
              gameboard={appendTwoBoards(setupBoard[townController.ourPlayer.id],
                guessedBoards[getOtherPlayerId()].board)}
              handleClick={()=>{}}
            />
            <BattleshipGrid
              width={7}
              height={7}
              gameboard={
                appendTwoBoards(guessedBoards[townController.ourPlayer.id].board,
                  guessedBoards[townController.ourPlayer.id].board)
              }
              handleClick={()=>{}}
            />
        </div>
        </div>
      )}
         <ModalCloseButton />
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }
  else {
    return (<>
    <Modal
        isOpen={isOpen}
        onClose={() => {
          close();
          townController.unPause();
        }}
        size='2xl'>
        <ModalOverlay> </ModalOverlay>
        <ModalContent>
        <ModalBody>
          <ModalHeader>End of game</ModalHeader>
          <div className='modalContent'>
          {(turn == townController.ourPlayer.id) ? (
          <>
          You Lost
          </>
      ) : (
        <>
          You Won
          </>
      )}
          </div>
          <ModalCloseButton />
          </ModalBody>
        </ModalContent>
      </Modal></>)
  }
}

export function BattleshipViewer({
  battleshipArea,
}: {
  battleshipArea: BattleshipAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const battleshipAreaController = useBattleshipAreaController(battleshipArea.name);
  const [selectIsOpen, setSelectIsOpen] = useState(
    true
  );
  return (
    <>
      <BattleshipGridWrapper
        isOpen={selectIsOpen}
        close={() => {
          setSelectIsOpen(false);
          townController.interactEnd(battleshipArea);
        }}
        battleshipArea={battleshipArea}
        gameboard={[
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
        ]}
      />
    </>
  );
}

export default function BattleshipViewerWrapper(): JSX.Element {
  const battleshipArea = useInteractable<BattleshipAreaInteractable>('battleshipArea');
  if (battleshipArea) {
    return <BattleshipViewer battleshipArea={battleshipArea} />;
  }
  return <></>;
}
