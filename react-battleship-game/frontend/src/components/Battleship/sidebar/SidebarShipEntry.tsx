import React from 'react';

import twoShipH from '../shipPhotos/2TileShipHorizontal.jpg';
import twoShipV from '../shipPhotos/2TileShipVertical.jpg';
import threeShipH from '../shipPhotos/3TileShipHorizontal.jpg';
import threeShipV from '../shipPhotos/3TileShipVertical.jpg';
import fourShipH from '../shipPhotos/4TileShipHorizontal.jpg';
import fourShipV from '../shipPhotos/4TileShipVertical.jpg';
import './SidebarShipEntry.css';

export function SidebarShipEntry({
  id,
  length,
  handleClick,
}: {
  id: number;
  length: number;
  handleClick: (len: number, direction: string, id: number) => void;
}): JSX.Element {
  //const size = 50;
  if (length == 2) {
    return (
      <div className='entry'>
        <h1>Ship {id}</h1>
        <div className='pics'>
          <img className='picH' src={twoShipV} alt='' onClick={() => handleClick(2, 'V', id)} />
          <img className='picV' src={twoShipH} alt='' onClick={() => handleClick(2, 'H', id)} />
        </div>
      </div>
    );
  } else if (length == 3) {
    return (
      <div className='entry'>
        <h1>Ship {id}</h1>
        <div className='pics'>
          <img className='picH' src={threeShipV} alt='' onClick={() => handleClick(3, 'V', id)} />
          <img className='picV' src={threeShipH} alt='' onClick={() => handleClick(3, 'H', id)} />
        </div>
      </div>
    );
  } else {
    return (
      <div className='entry'>
        <h1>Ship {id}</h1>
        <div className='pics'>
          <img className='picH' src={fourShipV} alt='' onClick={() => handleClick(4, 'V', id)} />
          <img className='picV' src={fourShipH} alt='' onClick={() => handleClick(4, 'H', id)} />
        </div>
      </div>
    );
  }
}
