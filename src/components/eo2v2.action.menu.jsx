import { Button } from 'primereact/button';
import React, { useRef } from 'react';
import { Menu as PMenu } from 'primereact/menu';


export default function Eo2v2ActionMenu(props) {
  const menuLeft = useRef(null);


  const items = props.menus.map((button, index) => ({
    label: button.text,
    icon: 'pi-arrow-up-right',
    command: () => {
      typeof button.onClick === 'function' && button.onClick();
    },
  }))


  return (
    <div>
      {props.menus.length > 0 && (
        <Button
          icon="pi pi-ellipsis-h"
          severity='secondary'
          className="mr-2"
          rounded
          raised
          text
          outlined
          style={{ width: '32px', height: '32px' }}
          onClick={(event) => menuLeft.current.toggle(event)}
          aria-controls="popup_menu_left"
          aria-haspopup
          tooltip={props.title || 'Actions'}
          tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}
        />
      )}
      <PMenu model={items} popup ref={menuLeft} id="popup_menu_left" popupAlignment="right" />
    </div>
  );

}
