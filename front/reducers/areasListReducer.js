// Material Icons
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice'
import AddIcon from '@mui/icons-material/Add';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

// Types:
import TYPES from './areasListReducer.types';

// Utils:
import { adaptNumTwo, reformatNum } from '../util/format';
import { sumPorc } from '../util/functionals';

const serviceColumns = {
    id:                   { hidden: true },
    name:                 { title: 'Service',    hidden: false, returnData: true, titlealign: 'left', cellalign: 'left',  type: 'string', aggregates: 'count' },
    unit_masurement_val:  { hidden: true },
    unit_masurement:      { title: 'Unit Mas.',  hidden: false, returnData: true, titlealign: 'left', cellalign: 'left',  type: 'button',   events: { onClick: (e, row, col, indexes) => setSelectedColRow({list: lists.Services, row, index: indexes.row}) } },
    price:                { title: 'Price',      hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', editable: true },
    quantity:             { title: 'Quantity',   hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', editable: true },
    taxe:                 { title: 'Taxe %',     hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number'/*, aggregates: 'avg'*/, format: 'f2', editable: true },
    subtotal:             { title: 'Subtotal',    hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', cellsrender: (row) => (reformatNum(row.price, 'en') * reformatNum(row.quantity, 'en')) },
    total:                { title: 'Total',      hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', cellsrender: (row) => sumPorc(reformatNum(row.price, 'en') * reformatNum(row.quantity, 'en'), reformatNum(row.taxe)) },
    audios_val:           { hidden: true },
    audio:                { title: (<>Audio Note <KeyboardVoiceIcon/></>),   returnData: true, titlealign: 'left', cellalign: 'right', type: 'button', events: { onClick: (e, row, col, indexes) => setIsOpenAudioModal(true) }, cellsrender: (row) => !!row.audios_val ? <GraphicEqIcon/> : <AddIcon/>}
};

const initialListState = {
    data: [],
    columns: serviceColumns,
    selection: {},
    selectionLength: 0,
    edditing: {}
}

const initialArea = {
    id: null,
    parent_group: null,
    parents_ids: null,
    parent_concat: null,
    principal: null,
    code: null,
    name: null,
    description: null,
    // __services: initialListState
};

const initialState = {
    areas: [],
    // selected: {},
    // editing: {},
    // countSelected: 0,
    //serviceColumns: serviceColumns
};

export { TYPES, initialState, initialListState };

export default function areasListReducer(state, action) {
    let data = null;

    switch(action.type) {
        // Actualiza el valor del campo data:
        case TYPES.UPDATE_DATA:
            if(!Array.isArray(action.payload)) return state;
            return { ...state, areas: action.payload};

        // Aggrega un nuevo registro a la lista de areas:
        case TYPES.ADD_AREA:
            return { ...state, areas: [...state.areas, {...initialArea, ...(action.payload ?? {})}] };

        // Actualiza un registro de la lista de areas referenciado por el índice de la lista:
        case TYPES.UPDATE_AREA:
            if(!state.areas[action.payload.index]) return state;
            data = state.areas;
            data[action.payload.index] = action.payload.row;
            return { ...state, areas: data};

        // Elimina un registro de la lista de areas referenciado por el índice de la lista:
        case TYPES.REMOVE_AREA:
            if(!state.areas[action.payload]) return state;
            data = state.areas;
            data.splice(action.payload, 1);
            return { ...state, areas: data};

        default:
            return state;
    }
}