import React from 'react';
import './BattleshipGrid.css';
import { BattleshipGridCell } from './BattleshipGridCell';

export function BattleshipGrid({
  width,
  height,
  gameboard,
  handleClick,
}: {
  width: number;
  height: number;
  gameboard: string[][];
  handleClick: (xCoordinate: number, yCoordinate: number) => void;
}): JSX.Element {
  const renderTD = () => {
    const td = [];
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        td.push(
          <BattleshipGridCell cellType={gameboard[i][j]} handleClick={() => handleClick(j, i)} />,
        );
      }
    }
    return td;
  };
  return (
    <div className='battleshipGrid'>
      {renderTD()}
      {console.log('GAMEBOARD :', gameboard)}
    </div>
  );
}
