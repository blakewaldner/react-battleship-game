import React from 'react';
import './SidebarStyles.css';
import './SidebarShipEntry';
import { SidebarShipEntry } from './SidebarShipEntry';

export function setReadyState() {
  console.log('sidebar');
}

export function BattleshipSidebar({
  entries,
  handleClick,
}: {
  entries: { id: number; length: number }[];
  handleClick: (len: number, direction: string, id: number) => void;
}): JSX.Element {
  const renderTD = () => {
    const td = [];
    for (let i = 0; i < entries.length; i++) {
      td.push(
        <SidebarShipEntry
          id={entries[i].id}
          length={entries[i].length}
          handleClick={handleClick}
        />,
      );
    }
    return td;
  };

  return (
    <div className='right'>
      <div className='sidebar'>{renderTD()}</div>
    </div>
  );
}
