import React from 'react';
import water from './GridCell.jpg';
import gray from './gray.png';
import grayhit from './grayhit.png';
import miss from './miss.jpg';
import hit from './hit.png';
import sunk from './sunk.png';

export function BattleshipGridCell({
  cellType,
  handleClick,
}: {
  cellType: string;
  handleClick: () => void;
}): JSX.Element {
  if (cellType.includes('S') && (cellType.includes('H') || cellType.includes('K'))) {
    return (
      <>
        <img src={grayhit} width={50} height={50} alt='' />
      </>
    );
  } else if (cellType.includes('K')) {
    return (
      <>
        <img src={sunk} width={50} height={50} alt='' />
      </>
    );
  } else if (cellType.includes('H')) {
    return (
      <>
        <img src={hit} width={50} height={50} alt='' />
      </>
    );
  } else if (cellType.includes('S')) {
    return (
      <>
        <img src={gray} width={50} height={50} alt='' />
      </>
    );
  } else if (cellType.includes('M')) {
    return (
      <>
        <img src={miss} width={50} height={50} alt='' />
      </>
    );
  } else {
    return (
      <>
        <img src={water} width={50} height={50} alt='' onClick={handleClick} />
      </>
    );
  }
}
