// Components:
import Loader from './Loader';

// Material Components:
import {
  List as MaterialList,
  ListItem as MaterialListItem,
  Dialog,
  DialogTitle,
  CircularProgress
} from '@mui/material';

export default function UnitMeasurementSelectableList({isOpen, list, message, isLoading, onClose, open, onSelect}) {
  return (
    <Dialog
      onClose={onClose}
      open={isOpen}
      className = 'unit-measurement-selectable-list'
    >
      <DialogTitle>Select the unit of measure</DialogTitle>
      <MaterialList sx={{ pt: 0 }}>
        {!!isLoading ? (
          <div className = 'centerFlex'>
            <CircularProgress
              style = {{
                margin: '1em auto',
                fontSize: '1em'
              }}
            />
          </div>
        ) : (
          <>
            {(list.__values.length < 1 && Object.keys(list).length < 2) ? <div className='unit-measurement-selectable-list__message'>{message}</div> : (
              <>
                {list.__values.map((el, i) => (
                  <MaterialListItem
                    button
                    onClick={() => onSelect(el)}
                    key = {el.id}
                    sx = {{fontSize: '1em'}}
                  >
                    {`${el.name} (${el.symbol})`}
                  </MaterialListItem>
                ))}

                {Object.keys(list).map((type) => (type === '__values') ? null : (
                  <>
                    <div className = 'unit-measurement-selectable-list__type-title'>{type}</div>

                    {list[type].__values.map((value) => (
                      <MaterialListItem
                        key = {value.id}
                        button
                        onClick={() => onSelect(value)}
                        sx = {{fontSize: '1em'}}
                      >
                        {`${value.name} (${value.symbol})`}
                      </MaterialListItem>
                    ))}

                    {Object.keys(list[type]).map(subtype => (subtype === '__values') ? null : (
                      <>
                        <div className = 'unit-measurement-selectable-list__subtype-title'>{subtype}</div>

                        {list[type][subtype].map((value) => (
                          <MaterialListItem
                            button
                            onClick={() => onSelect(value)}
                            key = {value.id}
                            sx = {{fontSize: '1em'}}
                          >
                            {`${value.name} (${value.symbol})`}
                          </MaterialListItem>
                        ))}
                      </>
                    ))}
                  </>
                ))}
              </>
            )}
          </>
        )}
      </MaterialList>
    </Dialog>
  );
};