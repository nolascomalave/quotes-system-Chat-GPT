import { useState, useEffect, useRef, useReducer } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import io from 'socket.io-client';
import { useSnackbar } from 'notistack';
import {parse, stringify} from 'flatted/esm';
//import {Editor, EditorState} from 'draft-js';


// Layout:
import Layout from '../../components/sections/Layout';

// Components:
import MainContainer from '../../components/sections/MainContainer';
import AreasList from '../../components/AreasList';
import List from '../../components/List';
import Input from '../../components/floatLabel/Input';
import Select from '../../components/floatLabel/Select';
import Modal from '../../components/Modal';
import SearchSelector from '../../components/SearchSelector';
import AreaItem from '../../components/SearchSelector/AreaItem';
import InputAudioModal from '../../components/InputAudioModal';
import AreasFormQuotation from '../../components/AreasFormQuotation';
import ModalAudioPlayer from '../../components/ModalAudioPlayer';
import TextEditor from '../../components/TextEditor/';
import CheckBox from '../../components/CheckBox';
import UnitMeasurementSelectableList from '../../components/UnitMeasurementSelectableList';
import ErrorsModal from '../../components/ErrorsModal';

// Material Components:
import { SpeedDial, SpeedDialAction, List as MaterialList, ListItem as MaterialListItem } from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

// Material Icons:
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import AddHomeIcon from '@mui/icons-material/AddHome';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

// Reducer:
import areasListReducer, { TYPES, initialState as initialAreasListState, initialListState } from '../../reducers/areasListReducer';

// Hooks:
import useAreasList from '../../hooks/useAreasList';
import useList from '../../hooks/useList';
import useGetMinimalCustomer from '../../hooks/useGetMinimalCustomer';
//import useTimer from '../../hooks/useTimer';
import useForm from '../../hooks/useForm';
import useAudioRecorder from '../../hooks/useAudioRecorder';
import useSearchSelector from '../../hooks/useSearchSelector';
import useUnitMeasurementList from '../../hooks/useUnitMeasurementList';


// Utils:
import { reformatNum } from '../../util/format';
import { sumPorc } from '../../util/functionals';
import { ClientFetch } from '../../util/Fetching';
import HandlerErrors from '../../util/HandlerErrors';
import {
  validateEmail,
  validateSimpleText,
  validateSSN,
  validatePhoneNumber,
  validateId,
  validateDate,
  validateName,
  validateGender,
  validateCuantity,
} from '../../util/validators';


// Consts:
const initialAudioPlayerState = {
  url: null,
  isOpen: false,
  onDelete: null
};

const lists = {
  Services: 'Services',
  ServicesByAreas: 'ServicesByAreas',
  Materials: 'Materials'
};

/*const searchTypes = {
  Customer:       {name: 'Customer',        title: 'Customer',          Item: AreaItem},
  Services:       {name: 'Services',        title: 'Services',          Item: AreaItem},
  Materials:      {name: 'Materials',       title: 'Materials',         Item: AreaItem},
  Areas:          {name: 'Areas',           title: 'Areas',             Item: AreaItem},
  ServicesByArea: {name: 'ServicesByArea',  title: 'Services by Area',  Item: AreaItem}
}*/

export default function AddQuotes() {
  const socket = io(process.env.API);
  const socketInterval = useRef(); // Variable que almacena el temporizador de envío de datos al servidor por web sockets.
  const [ isConnectedSocket, setIsConnectedSocket ] = useState(false); // Variable que almacena el estado de conexión con el servidor a través de web Sockets.
  const customerNameInput = useRef(); // Referencia el input name del formulario del cliente. Para hacer focus automático cuando se selecciona la edición del cliente.const customerNameInput = useRef(); // Referencia el input name del formulario del cliente. Para hacer focus automático cuando se selecciona la edición del cliente.
  const customerFirstNameInput = useRef(); // Referencia el input name del formulario del cliente. Para hacer focus automático cuando se selecciona la edición del cliente.
  const [ quotationState, setQuotationState ] = useState({}); // Variable que almacena el estado completo de la cotización, es decir, los servicios, el cliente, datos de la cotización, áreas, materiales, etc.
  const [ isOpenAreaModal, setIsOpenAreaModal ] = useState(true); // Variable que almacena el estado del formulario modal de áreas.
  // const [ unitMeasurementList, setUnitMeasurementList ] = useState({isOpen: false, list: [{name: 'Square Foot', symbol: 'Ft2', id: 1}]}); // Lista de unidades de medida para ser seleccionadas como valor.
  const { list: UMList, isOpen: UMIsOpen, isLoading: UMIsLoading, setLoading: UMSetLoading, open: UMOpen, close: UMClose, setList: UMSetList, setMessage: UMSetMessage, message: UMMessage, setUnitMeasurementList: UMSetState } = useUnitMeasurementList();
  const [ selectedColRow, setSelectedColRow ] = useState({list: null, row: null, index: null, area: null}); // Variable que almacena el estado de la fila seleccionada de alguna de las listas a la cual se le seleccionará la unidad de medida.
  const { customer, edit: editableCustomer, errors: errorsCustomer, customerHandleChange, changeEditMode: customerChangeEditMode, enableEditing: customerEnableEditing, disableEditing: customerDisableEditing, addCustomer } = useGetMinimalCustomer(); // Estado y métodos del formulario de cliente.
  const { form: quotation, handleChange: quotationHandleChange, errors: quotationErrors, setErrors: setQuotationErrors, changeValue: quotationChangeValue } = useForm({}); // Formulario de datos de la cotización.
  const [ errors, setErrors ] = useState({isOpen: false, errors: []});
  const { enqueueSnackbar } = useSnackbar();

  // Audio Player State:
  const [ audioPlayer, setAudioPlayer ] = useState(initialAudioPlayerState); // Estado del reproductor de audios.

  // Variable que almacena los audios que aún no han sido enviados al servidor o que no han sido guardados.
  let audios = {
    areas: {},
    services: {},
    materials: {}
  };
  /*const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );*/

  // Constante que almacena el estado inicial de valores de opciones:
  const globalParamsInitialState = {
    Areas: {
      title: 'Areas',
      item: AreaItem,
      onAccept: (areas) => addMultipleAreas(areas),
      selectExisting: (item, listItem) => (((item.id === listItem.id) && (item.id ?? null) !== null) && item.id_parent === listItem.id_parent),
      list: [],
      params: {},
      audioSave: null
    },
    Services: {
      title: 'Services',
      item: AreaItem,
      onAccept: (services) => services.forEach((el) => addService({
          id: el.id,
          name: el.name,
          price: el.price,
          quantity: el.quantity,
          taxe: el.taxe,
          subtotal: el.subtotal,
          total: el.total,
          audio: el.audio_val,
          id_unit_masurement: !!el.unit_masurement_val ? el.unit_masurement_val.id : null
        })),
      selectExisting: (item, listItem) => (((item.id === listItem.id) && (item.id ?? null) !== null) && item.id_parent === listItem.id_parent),
      list: [],
      params: {},
      audioSave: null
    },
    Materials: {
      title: 'Materials',
      item: AreaItem,
      onAccept: (services) => services.forEach((el) => addMaterial({
          id: el.id,
          name: el.name,
          price: el.price,
          quantity: el.quantity,
          taxe: el.taxe,
          subtotal: el.subtotal,
          total: el.total,
          audio: el.audio_val,
          id_unit_masurement: !!el.unit_masurement_val ? el.unit_masurement_val.id : null
        })),
      selectExisting: (item, listItem) => (((item.id === listItem.id) && (item.id ?? null) !== null)),
      list: [],
      params: {},
      audioSave: null
    },
    Customer: {
      title: 'Customer',
      item: AreaItem,
      onAccept: (customers) => addCustomer({
        id: customers[0].id,
        name: customers[0].name,
        first_name: customers[0].first_name,
        first_last_name: customers[0].first_last_name,
        ssn: customers[0].SSN,
        email: customers[0].email,
        phone: customers[0].phone
      }),
      selectExisting: (item, listItem) => (((item.id === listItem.id) && (item.id ?? null) !== null)),
      list: [],
      params: {},
      audioSave: null,
      onlyOneSelection: true
    }
  }

  // Estado de opciones globales:
  const [globalParamsState, setGlobalParamsState] = useState(globalParamsInitialState.Areas);

  // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


  // Estados y controladores del reproductor de audio:
  const { play, stop, clear: clearAudio, timer, audio, mediaRecorder, audioRecorderParams, isOpen: isOpenAudioModal, setIsOpen: setIsOpenAudioModal } = useAudioRecorder();

  // Definición de columnas del listado de servicios:
  const serviceColumns = {
    id:                   { hidden: true },
    name:                 { title: 'Service',    hidden: false, returnData: true, titlealign: 'left', cellalign: 'left',  type: 'string', aggregates: 'count' },
    unit_masurement_val:  { hidden: true },
    unit_masurement:      { title: 'Unit Mas.',  hidden: false, returnData: true, titlealign: 'left', cellalign: 'left',  type: 'button',   events: { onClick: (e, row, col, indexes) => setSelectedColRow({list: lists.Services, row, index: indexes.row}) } },
    price:                { title: 'Price',      hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', editable: true },
    quantity:             { title: 'Quantity',   hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', editable: true },
    taxe:                 { title: 'Taxe %',     hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number'/*, aggregates: 'avg'*/, format: 'f2', editable: true },
    subtotal:             { title: 'Subtotal',   hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', cellsrender: (row) => (reformatNum(row.price, 'en') * reformatNum(row.quantity, 'en')) },
    total:                { title: 'Total',      hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', cellsrender: (row) => sumPorc(reformatNum(row.price, 'en') * reformatNum(row.quantity, 'en'), reformatNum(row.taxe)) },
    audio_val:            { hidden: true },
    audio:                { title: (<>Audio Note <KeyboardVoiceIcon/></>),   returnData: true, titlealign: 'left', cellalign: 'right', type: 'button', events: {
      onClick: (e, row, col, indexes) => {
        if(!!row.audio_val){
          if(typeof audios.services[indexes.row] === 'string') return setAudioPlayer({...audioPlayer, url: `${process.env.API}files/quotes/audios/${row.audio_val}`, isOpen: true});

          let reader = new FileReader();
          reader.onload = function(e){
            setAudioPlayer({
              ...audioPlayer,
              url: e.target.result,
              isOpen: true,
              onDelete: () => deleteAudio('services', row, indexes.row)
            });
          };

          reader.readAsDataURL(audios.services[indexes.row]);
          return;
        }

        setGlobalParamsState({
          ...globalParamsState.Services,
          audioSave: async (audio) => saveAudio('service', audio, row, indexes.row)
        });
        setIsOpenAudioModal(true);
      }
    }, cellsrender: (row) => !!row.audio_val ? <GraphicEqIcon/> : <AddIcon/>}
  };

  // Definición de columnas del listado de Materiales:
  const materialColumns = {
    id:                   { hidden: true },
    name:                 { title: 'Service',    returnData: true, titlealign: 'left', cellalign: 'left',  type: 'string', aggregates: 'count' },
    brand:                { title: 'Brand',      returnData: true, titlealign: 'left', cellalign: 'left',  type: 'string' },
    model:                { title: 'Model',      returnData: true, titlealign: 'left', cellalign: 'left',  type: 'string' },
    unit_masurement_val:  { hidden: true },
    unit_masurement:      { title: 'Unit Mas.',  hidden: false, returnData: true, titlealign: 'left', cellalign: 'left',  type: 'button',   events: { onClick: (e, row, col, indexes) => setSelectedColRow({list: lists.Materials, row, index: indexes.row}) } },
    price:                { title: 'Price',      returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', editable: true },
    quantity:             { title: 'Quantity',   returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', editable: true },
    taxe:                 { title: 'Taxe %',     hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number'/*, aggregates: 'avg'*/, format: 'f2', editable: true },
    subtotal:             { title: 'Subtotal',    hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', cellsrender: (row) => (reformatNum(row.price, 'en') * reformatNum(row.quantity, 'en')) },
    total:                { title: 'Total',      hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', cellsrender: (row) => sumPorc(reformatNum(row.price, 'en') * reformatNum(row.quantity, 'en'), reformatNum(row.taxe)) },
    audio_val:            { hidden: true },
    audio:                { title: (<>Audio Note <KeyboardVoiceIcon/></>),   returnData: true, titlealign: 'left', cellalign: 'right', type: 'button', events: {
      onClick: (e, row, col, indexes) => {
        if(!!row.audio_val){
          if(typeof row.audio_val === 'string') return setAudioPlayer({...audioPlayer, url: `${process.env.API}files/quotes/audios/${row.audio_val}`, isOpen: true});

          let reader = new FileReader();
          reader.onload = function(e){
            setAudioPlayer({
              ...audioPlayer,
              url: e.target.result,
              isOpen: true,
              onDelete: () => deleteAudio('materials', row, indexes.row)
            })
          };

          reader.readAsDataURL(audios.materials[indexes.row]);
          return;
        }

        setGlobalParamsState({
          ...globalParamsState.Material,
          audioSave: async (audio) => saveAudio('material', audio, row, indexes.row)
        });
        setIsOpenAudioModal(true);
      }
    }, cellsrender: (row) => !!row.audio_val ? <GraphicEqIcon/> : <AddIcon/>}
  };

  // Esdados y controladores del mismo de Servicios y de Materiales:
  const { listParams: servicesParams, addNewRow: addNewService, addRow: addService, selectionLength: selectedServicesLength, removeSelectedRows: removeSelectedServices, updateRowByIndex: servicesUpdateRow, getRowByIndex: getServiceRow} = useList([], serviceColumns);
  const { listParams: materialsParams, addNewRow: addNewMaterial, addRow: addMaterial, selectionLength: selectedMaterialsLength, removeSelectedRows: removeSelectedMaterials, updateRowByIndex: materialsUpdateRow, getRowByIndex: getMaterialRow } = useList([], materialColumns);


  // Estado y controladores del mismo del buscador selector:
  const { search, selected, searchSelectorParams, setIsOpen, value, setUrl} = useSearchSelector([], (globalParamsState.onlyOneSelection ?? false), (process.env.API + 'areas'));


  // Areas List Reducer And Hook handler:
  // const [ areasListState, areasListDispatch ] = useReducer(areasListReducer, {...initialAreasListState, areas: []});
  //const { areasParams, addArea } = useAreasList(areasListState, areasListDispatch);
  const { areasParams, setAreas, addArea, updateArea, addMultipleAreas, state: areasListState, dispatch: areasListDispatch } = useAreasList([], {
    ...serviceColumns,
    unit_masurement: { ...serviceColumns.unit_masurement, events: { onClick: (e, row, col, indexes, extraParams) => setSelectedColRow({list: lists.ServicesByAreas, row, index: indexes.row, area: extraParams.indexArea })}},
    audio:           { title: (<>Audio Note <KeyboardVoiceIcon/></>),   returnData: true, titlealign: 'left', cellalign: 'right', type: 'button', events: {
        onClick: (e, row, col, indexes, extraParams) => {
          if(!!row.audio_val){
            if(typeof row.audio_val === 'string') return setAudioPlayer({...audioPlayer, url: `${process.env.API}files/quotes/audios/${row.audio_val}`, isOpen: true});

            let reader = new FileReader();
            reader.onload = function(e){
              setAudioPlayer({
                ...audioPlayer,
                url: e.target.result,
                isOpen: true,
                onDelete: () => deleteAudio('areas', row, indexes.row, extraParams.indexArea)
              });
            };

            return reader.readAsDataURL(audios.areas[extraParams.indexArea][indexes.row]);
            // return readAudio(reader, 'areas', indexes.row, extraParams.indexArea);
          }

          setGlobalParamsState({
            ...globalParamsState.Areas,
            audioSave: async (audio) => saveAudio('area', audio, row, indexes.row, extraParams.indexArea, extraParams.area)
          });
          setIsOpenAudioModal(true);
        }
      }, cellsrender: (row) => !!row.audio_val ? <GraphicEqIcon/> : <AddIcon/>}
  });

  // Estado y controlador del mismo del formulario de areas:
  const areaForm = useForm();

  // Acciones del SpeedDial:
  const actions = [
    {
      name: 'Add Area',
      icon: <AddHomeIcon/>,
      function: () => {
        setGlobalParamsState({
          ...globalParamsInitialState.Areas,
          list: areasListState.areas
        });
        setUrl(process.env.API + 'areas');
        setIsOpen(true)
      }
    },
    {
      name: 'Add Service',
      icon: <AddHomeWorkIcon/>,
      function: () => {
        setGlobalParamsState({
          ...globalParamsInitialState.Services,
          list: servicesParams.data
        });
        setUrl(process.env.API + 'services');
        setIsOpen(true)
      }
    },
    {
      name: 'Add Material',
      icon: <AddShoppingCartIcon/>,
      function: () => {
        setGlobalParamsState({
          ...globalParamsInitialState.Materials,
          list: materialsParams.data
        });
        setUrl(process.env.API + 'materials');
        setIsOpen(true)
      }
    }
  ];

  // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // -- Métodos manejadores de estado, etc: -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // Método que actualiza el valor de la columna "Unit Masurement" de la fila seleccionada de una de las listas:
  const changeUnitMasurementOfRowList = (el) => {
    let changeRow = selectedColRow.list === lists.Materials ? materialsUpdateRow : servicesUpdateRow;

    if(selectedColRow.area !== undefined && selectedColRow.area !== null) {
      areasParams.servicesFn.updateServiceRowByIndex(selectedColRow.area, selectedColRow.index, {
        ...selectedColRow.row,
        unit_masurement_val: el.id,
        unit_masurement: `${el.name} (${el.symbol})`
      });
    } else {
      changeRow(selectedColRow.index, {
        ...selectedColRow.row,
        unit_masurement_val: el.id,
        unit_masurement: `${el.name} (${el.symbol})`
      });
    }

    setSelectedColRow({list: null, row: null, index: null, area: null});
    UMClose();
  };

  // Inicia la grabación del audio:
  const recordingPress = () => {
      if(!!mediaRecorder) return;

      play();
      window.navigator.vibrate([250]);
  };

  // Finaliza la grabación del audio:
  const recordingOut = () => {
    if(!mediaRecorder) return;

    stop();
    window.navigator.vibrate([250]);
  };

  // Guarda el audio en a través de los índices del registro donde se agregará el audio:
  const saveAudio = async (type, audio, row, index, indexArea, area) => {
    row.audio_val = 1;

    if(type === 'area'){
      let servicesData = area.__services.data;

      type = 'areas';
      servicesData[index] = row;

      updateArea(indexArea, {
        ...area,
        __services: {
          ...area.__services,
          data: servicesData
        }
      });

      audios = {
        ...audios,
        areas: {
          ...audios.areas,
          [indexArea]: !!audios.areas[indexArea] ? ({...audios.areas[indexArea], [index]: audio}) : {[index]: audio}
        }
      };
      return sendAudioToServer(type, audio, row, index, indexArea);
    }else if(type === 'service'){
      type = 'services';
      servicesUpdateRow(index, row);
    }else{
      type = 'materials';
      materialsUpdateRow(index, row);
    }

    let newAudios = {
      ...audios,
      [type]: {
        ...audios[type],
        [index]: audio
      }
    };

    audios = newAudios;
    sendAudioToServer(type, audio, row, index, indexArea);
  };

  // Envía el audio al servidor y, una vez guardado, actualiza el valor del audio en el registro de la lista
  // y lo elimina de la variable "audios".
  const sendAudioToServer = async (type, audio, row, index, indexArea) => {
    let ftc = new ClientFetch(),
        data = new FormData();

    data.append('audio', audio);

    try {
      res = await ftc.patch({
          url: `${process.env.API}quotes/save-record`,
          timeout: 600000,
          data
      });

      if(ftc.isStatus(res.status, 200, 403, 404, 406, 500)) {
        let response = await res.json();
            message = response.message,
            variant = res.status===200 ? 'success' : res.status===403 ? 'warning' : 'error';

        if(res.status !== 200) return enqueueSnackbar(message, {variant});

        if(type === 'areas') {
          if(!!audios.areas[indexArea] && audios.areas[indexArea][index] === audio){
            let servicesData = areasListState.areas[indexArea].__services.data;

            servicesData[index].audio_val = response.data;

            delete audios.areas[indexArea][index];

            return updateArea(indexArea, {
              ...areasListState.areas[indexArea],
              __services: {
                ...areasListState.areas[indexArea].__services,
                data: servicesData
              }
            });
          }
        } else if(audios[type][index] === audio) {
            row = (type === 'services' ? servicesParams : materialsParams).data[index];

            row.audio_val = response.data;

            delete audios[type][index];

            return (type === 'services' ? servicesUpdateRow : materialsUpdateRow)(index, row);
        }

        return socket.emit("quotation:delete-audio", response.data);
      }

      throw true;

    } catch(e) {
      // if(!ftc.aborted()) enqueueSnackbar('Unexpected response!', {variant:'error'});
    }
  };

  // Elimina el audio del registro y lo elimina del servidor a través de una emisión del web socket.
  const deleteAudio = async (type, row, index, indexArea) => {
    let audio = row.audio_val;
    if(type === 'areas') {
      let servicesData = areasListState.areas[indexArea].__services.data;

      servicesData[index] = { ...servicesData[index], audio_val: null};

      updateArea(indexArea, {
        ...areasListState.areas[indexArea],
        __services: {
          ...areasListState.areas[indexArea].__services,
          data: servicesData
        }
      });
    } else {
      if(!!audios[type][index]) delete audios[type][index];

      row.audio_val = null;

      if(type === 'materials') materialsUpdateRow(index, row);
      else servicesUpdateRow(index, row);
    }

    setAudioPlayer({...audioPlayer, isOpen: false, url: null, onDelete: null});

    if(typeof audio === 'string') socket.emit("quotation:delete-audio", audio);
  }

  // Obtiene la lista de unidades de medida:
  const getUnitsMeasurements = async () => {
    let ftc = new ClientFetch();

    UMSetLoading(true);

    //console.clear();

    try {
      let res = await ftc.get({
          url: `${process.env.API}unit_measurement/`,
          timeout: 600000
      });

      if(ftc.isStatus(res.status, 200, 403, 404, 406, 500)) {
        let response = await res.json(),
            message = response.message,
            variant = res.status===200 ? 'success' : res.status===403 ? 'warning' : 'error';

        UMSetLoading(false);

        if(res.status !== 200) return UMSetMessage('An error occurred while loading the data!'); //enqueueSnackbar(message, {variant});

        UMSetList(response.data);
      }
    } catch(e) {
    }
  };

  // Valida los datos del formulario de cotización:
  const validateQuotationForm = (quotationData) => {
    const errors = new HandlerErrors();
    const today = new Date();

    errors.set('code', validateSimpleText(quotationData.code, 'code', 2, 15));
    errors.set('date', validateDate(quotationData.date ?? today, 'date', new Date(today.getTime() - (86400000 * 365)), today, true));

    // Validando la existencia de la moneda:
    if(quotationData.coin !== undefined && quotationData.coin !== null && quotationData.coin !== '') {
      errors.set('coin', validateId(quotationData.coin, 'coin', true));
    } else {
      errors.set('coin', 'You must choise a coin!');
    }

    console.log(errors.getErrors());

    return errors.getErrors();
  }

  // Valida los datos del formulario del cliente:
  const validateCustomerForm = (customerData) => {
    const errors = new HandlerErrors();

    if(!!customerData.is_natural) {
      errors.set('first_name', validateName(customerData.first_name, 'first name', true));
      errors.set('first_last_name', validateName(customerData.first_last_name, 'first last name', true));
      errors.set('ssn', validateSSN(customerData.ssn, true));
      errors.set('gender', validateGender(customerData.gender, true));
    } else {
      errors.set('name', validateSimpleText(customerData.name, 'name', 2, 50, true));
    }

    errors.set('email', validateEmail(customerData.email, true));
    errors.set('phone', validatePhoneNumber(customerData.phone, true));

    return errors.getErrors();
  }

  // Valida los items de una lista (materiales o servicios):
  const getValidatedItemsList = (items, type) => {
    const errors = new HandlerErrors();
    let thereIsData = false;

    if(!Array.isArray(items)) errors.set('items', `The list of ${type} must be defined in array format!`);
    else if(items.length > 0) thereIsData = true;
    else return {
      errors: null,
      thereIsData: false
    };

    if(errors.existsErrors()) return {thereIsData, errors: errors.getErrors()};

    items.forEach((el, index) => {
      // Si los errores alcanzan la cantidad máxima, retorna:
      if(errors.existsErrors() && (Object.keys(errors.getErrors()).length === (type.toLowerCase === 'materials' ? 9 : 7))) return;

      if(typeof el !== 'object' || Array.isArray(el)) {
        if(!errors.exists('item')) errors.set('item', `There is an ${type.toLowerCase()} list item that is defined in a different format than a JSON object!`);
        return;
      }

      let validations = {
        name: validateSimpleText(el.name, `${type.toLowerCase() === 'materials' ? 'material' : 'service'} name`, 1, 100,  true),
        ...(type.toLowerCase() === 'materials' ? {
          brand: (typeof el.brand === 'number') ? validateId(el.brand, 'brand') : validateSimpleText(el.brand, 'brand', 2, 100),
          model: (typeof el.model === 'number') ? validateId(el.model, 'model') : validateSimpleText(el.model, 'model', 2, 100)
        } : {}),
        unit_masurement: validateId(el.unit_masurement_val, 'unit measurement', true),
        price: validateCuantity({
          name: 'price',
          num: el.price,
          min: 0.00001,
          required: true
        }),
        quantity: validateCuantity({
          name: 'quantity',
          num: el.quantity,
          min: 0.00001,
          required: true
        }),
        taxe: validateCuantity({
          name: 'taxe',
          num: el.taxe,
          min: 0.00001,
          max: 100,
          required: true
        })
      };

      // Recorre los elementos del objeto validations y agrega los errores de tenerlos:
      console.clear();
      Object.keys(validations).forEach((el) => {
        errors.set(el, !validations[el] ? null : `Error found in the items of the ${type.toLowerCase()} list: ${validations[el]}`);
      });
    });

    return {thereIsData, errors: errors.getErrors()};
  };

  // Valida los datos del formulario del cliente:
  const getValidatedArea = (areas) => {
    const errors = new HandlerErrors();

    let thereIsData = false,
        thereIsServices = false;

    if(!Array.isArray(areas)) errors.set('areas', 'Areas data must be defined in array format!');
    else if(areas.length > 0) thereIsData = true;
    else return { thereIsData, errors: null, thereIsServices };

    if(errors.existsErrors() || thereIsData === false) return {
      errors: errors.getErrors(),
      thereIsData,
      thereIsServices
    };

    areas.some((area, indexArea) => {
      let validations = {
        id: validateId(area.id, 'area'),
        name: validateSimpleText(area.name, 'name', 1, 100, true),
        description: validateSimpleText(area.description, 'description', 5, 500),
        parent: (area.parent === undefined || area.parent === null) ? null : ((typeof area.parent === 'object' && !Array.isArray(area.parent)) ? validateId(area.parent.id, 'parent', true) : null)
      }

      if(!!area.__services) {
        if(!Array.isArray(area.__services)) {
          validations.services = 'The services of the area N°' + (indexArea + 1) + ' must be defined in array format!';
        } else {
          let validation = getValidatedItemsList(area.__services, `Services of Area N°${(indexArea + 1)}!`);

          thereIsServices = validation.thereIsData;

          validations.services = validation.errors ?? (!thereIsServices ? `You must define services in the area N°${(indexArea + 1)}!` : null);
        }
      } else {
        validations.services = `You must define services in the area N°${(indexArea + 1)}!`;
      }

      if(Object.keys(validations).some(el => !!validations[el])) errors.pushErrorInArray('areas', validations);
    });

    return { thereIsData: false, errors: errors.getErrors(), thereIsServices };
  }

  // Obtiene la cotización validando que los parámetros de la cotización estén bien definidos:
  const getQuote = () => {
    const errors = new HandlerErrors();

    const { quotation, customer, areas, services, materials } = quotationState;

    // Valida el formulario de la cotización:
    errors.set('quotation', validateQuotationForm(quotation));

    // Valida el formulario del cliente:
    errors.set('customer', validateCustomerForm(customer));

    // Obtener los datos validados de los servicios:
    let servicesValidation = getValidatedItemsList(services, 'Services');
    errors.set('services', servicesValidation.errors);

    // Obtener los datos validados de los materiales:
    let materialsValidation = getValidatedItemsList(materials, 'Materials');
    errors.set('materials', materialsValidation.errors);

    // Obtener los datos validados de las áreas:
    let areasValidation = getValidatedArea(areas);
    errors.set('areas', areasValidation.errors);

    if(!errors.existsErrors() && (!servicesValidation.thereData && !materialsValidation.thereData && (!areasValidation.thereIsData || !areasValidation.thereIsServicers))) {
      errors.set('lists', `To make a quote you must define at least one item in a list of services of a defined area, in the list of services or the list of materials!`);
    }

    if(!!errors.existsErrors()) {
      let {
        quotation: quotationErrorsData,
        customer: customerErrors,
        services: servicesErrors,
        materials: materialsErrors,
        lists,
        areas: areasErrors
      } = errors.getErrors();

      let errorsModal = [];

      Object.keys(quotationErrorsData).map(el => {
        errorsModal.push(quotationErrorsData[el]);
      });
      if(errorsModal.length > 0) errorsModal = [{ title: 'Quote Form', values: errorsModal }];

      let errorsCustomerData = [];
      Object.keys(customerErrors).map(el => {
        errorsCustomerData.push(customerErrors[el]);
      });
      if(errorsCustomerData.length > 0) errorsModal.push({ title: 'Customer Form', values: errorsCustomerData });

      if(!lists) {
        if(typeof (areasErrors ?? {}).areas === 'string') {
          errorsModal.push({ title: 'Areas List', values: [areasErrors.areas] });
        } else if(typeof (areasErrors ?? {}).areas === 'object') {
          let errorsAreas = [];
          areasErrors.areas.forEach(area => {
            Object.keys(area).forEach((el) => {
              if(!area[el]) return;

              if(typeof area[el] === 'string') return errorsAreas.push(area[el]);

              Object.keys(area[el]).forEach((err) => {
                if(!area[el][err]) return;
                errorsAreas.push(area[el][err]);
              });
            });
          });
          if(errorsAreas.length > 0) errorsModal.push({ title: 'Areas List', values: errorsAreas });
        }

        let errorsServices = [];
        Object.keys(servicesErrors ?? {}).forEach(el => {
          errorsServices.push(servicesErrors[el]);
        });
        if(errorsServices.length > 0) errorsModal.push({ title: 'Services List', values: errorsServices });

        let errorsMaterials = [];
        Object.keys(materialsErrors ?? {}).forEach(el => {
          errorsMaterials.push(materialsErrors[el]);
        });
        if(errorsMaterials.length > 0) errorsModal.push({ title: 'Materials List', values: errorsMaterials });
      } else {
        errorsModal.push(lists);
      }

      return setErrors({errors: errorsModal, isOpen: true});
    }



    console.log(quotationState);
  };

  // ---------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  // ---------------------------------------------------------------------------------------------------------------
  // -- Efectos de cambios de estados ------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  // Enfoca el campo "Name" cuando cambia el valor de la variable "editableCustomer" a true;
  useEffect(() => {
    if(editableCustomer === true) {
      if(!customer.is_natural) return customerNameInput.current.focus();
      customerFirstNameInput.current.focus();
    }
  }, [editableCustomer, customer.is_natural]);

  // Abre el modal de selección de unidades de medidas al hacer click en el campo del mismo en una lista.
  useEffect(() => {
    if(selectedColRow.list === null) return;

    if(UMList.__values.length < 1 && Object.keys(UMList).length < 2) getUnitsMeasurements();
    UMOpen();
  }, [selectedColRow]);

  useEffect(() => {
    let areas = [];

    areasListState.areas.forEach((area) => {
        let newArea = {
          id: area.id,
          id_parent: !!area.parent ? area.id_parent : null,
          name: area.name,
          description: area.description
        }

        newArea.__services = area.__services ? (area.__services.data.length > 0 ? area.__services.data : null) : null;

        areas.push(newArea);
    });

    let newData = {
      ...quotationState,
      quotation: quotation,
      customer: customer,
      areas: areas,
      services: servicesParams.data,
      materials: materialsParams.data
    };

    setQuotationState(newData);

    try{
      if(socketInterval.current) clearInterval(socketInterval.current);

      socketInterval.current = setTimeout(() => {
        newData = JSON.stringify(newData);
        socket.emit("quotation:draft", newData);
      }, 5000);
    }catch(e){
      console.error(e);
    }
  }, [quotation, customer, areasListState, servicesParams.data, materialsParams.data]);

  /*useEffect(() => {
    // console.log(quotationState);
  }, [quotationState]);*/

  useEffect(() => {
    getUnitsMeasurements();
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);
  // ---------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  // ---------------------------------------------------------------------------------------------------------------
  // Socket events: ------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------
  socket.on('connect', () => setIsConnectedSocket(true));

  socket.on('disconnect', () => setIsConnectedSocket(false));

  socket.on("quotation:draft", data => {
    if(!data.data) return;
    data = JSON.parse(data.data);

    setQuotationState(data);
  });
  // ---------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  return (
    <Layout>
      <MainContainer id="QuoteAdd" className="form-section">
        <div className = "detail-container">
          {/*Quotation detail ------------------------------------------------------------------------ */}
          <div className = "detail-container__detail">
              <div className = "detail-container__detail__header">
                <p className = "detail-container__detail__header__title truncado">Details</p>
              </div>
              <div className = "detail-container__detail__body">
                <div className="detail-container__detail__body__input-container">
                  <Input
                    onChange = {quotationHandleChange}
                    error = {quotationErrors.code}
                    name="code"
                    value = {quotation.code}
                    label="Code"
                    required={true}
                  />
                </div>
                <div className="detail-container__detail__body__input-container">
                  <Select
                    onChange = {quotationHandleChange}
                    error = {quotationErrors.coin}
                    name="coin"
                    label="Payment Coin"
                    value = {quotation.coin ?? 1}
                    required={true}
                  >
                    <option value = {1} selected = {true}>
                      Dollar $
                    </option>
                  </Select>
                </div>
                <div className="detail-container__detail__body__input-container">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MobileDatePicker
                      label="Date"
                      name = 'date'
                      onChange = {(value) => quotationChangeValue('date', value)}
                      maxDate = {new Date()}
                      value = {quotation.date ?? new Date()}
                      renderInput={(params) => <Input {...params} />}
                    />
                  </LocalizationProvider>
                </div>
              </div>
          </div>

          {/* Customer detail ------------------------------------------------------------------------ */}
          <div className = "detail-container__detail">
              <div className = "detail-container__detail__header bettwenFlex">
                <p className = "detail-container__detail__header__title truncado">Customer Info</p>
                <div className = "detail-container__detail__header__buttons">
                  <Button
                    onClick={() => {
                        setGlobalParamsState({
                          ...globalParamsInitialState.Customer,
                          list: !customer.id ? [] : [customer]
                        });
                        setUrl(process.env.API + 'customers');
                        setIsOpen(true);
                      }}
                    title = 'Choose a customer'
                  >
                    <PersonAddIcon/>
                  </Button>
                  {editableCustomer == false ? (
                    <Button
                      onClick={() => customerChangeEditMode(true)}
                      title = 'Add new customer'
                    >
                      <AddIcon/>
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className = "detail-container__detail__body">
                <div className = 'detail-container__detail__body__input-container all'>
                  <CheckBox
                    label = 'Legal Person'
                    name = 'is_natural'
                    checked = {customer.is_natural !== true}
                    error = {errorsCustomer.is_natural}
                    onChange = {!editableCustomer ? null : (e) => customerHandleChange(e, (value) => !value)}
                  />
                </div>
                {customer.is_natural !== true ? (
                  <div className="detail-container__detail__body__input-container all">
                    <Input
                        reference = {customerNameInput}
                        error = {errorsCustomer.name ?? null}
                        value = {customer.name}
                        onChange = {customerHandleChange}
                        name="name"
                        label="Name"
                        required={true}
                        readOnly = {!editableCustomer}
                    />
                  </div>
                ) : (
                  <>
                    <div className="detail-container__detail__body__input-container">
                      <Input
                          error = {errorsCustomer.first_name ?? null}
                          value = {customer.first_name}
                          onChange = {customerHandleChange}
                          name="first_name"
                          label="First Name"
                          required={true}
                          readOnly = {!editableCustomer}
                          reference = {customerFirstNameInput}
                      />
                    </div>

                    <div className="detail-container__detail__body__input-container">
                      <Input
                          error = {errorsCustomer.fist_last_name ?? null}
                          value = {customer.fist_last_name}
                          onChange = {customerHandleChange}
                          name="fist_last_name"
                          label="First Last Name"
                          required={true}
                          readOnly = {!editableCustomer}
                      />
                    </div>
                    <div className="detail-container__detail__body__input-container">
                      <Input
                          error = {errorsCustomer.ssn ?? null}
                          value = {customer.ssn}
                          onChange = {customerHandleChange}
                          name="ssn"
                          label="SSN"
                          required={true}
                          readOnly = {!editableCustomer}
                      />
                    </div>
                  </>
                )}
                <div className="detail-container__detail__body__input-container">
                  <Input
                      error = {errorsCustomer.email ?? null}
                      value = {customer.email}
                      onChange = {customerHandleChange}
                      name="email"
                      label="Email"
                      required={true}
                      readOnly = {!editableCustomer}
                  />
                </div>
                <div className="detail-container__detail__body__input-container">
                  <Input
                      error = {errorsCustomer.phone ?? null}
                      value = {customer.phone}
                      onChange = {customerHandleChange}
                      name="phone"
                      label="Phone Number"
                      required={true}
                      readOnly = {!editableCustomer}
                  />
                </div>
              </div>
          </div>
        </div>

        {/*Areas list ------------------------------------------------------------------------ */}
        <AreasList
          {...areasParams}
          addFn = {() => areaForm.setIsOpen(true)}
          editFn = {(index, area) => {
            let principal = !area.parent,
                principalWithSevices = !area.parent ? (!area.__services ? false : area.__services.data.length > 0) : false;

            if((area.id === null || area.id === undefined)) {
              let parents = [];

              areasListState.areas.forEach((el) => {
                if((el.id === null || el.id === undefined) && el.name === area.name && el.description === area.description && el.code === area.code) {
                  if(!el.parent === true) {
                    principalWithSevices = (!el.__services ? false : el.__services.data.length > 0);
                    return principal = true;
                  }

                  parents.push(el.parent);
                }
              });

              area.parents = parents;
            }

            area.principal = principal;
            area.principalWithSevices = principalWithSevices && area.parents.length > 0;

            areaForm.setForm({...area, __3d1t: index});
            areaForm.setIsOpen(true);
          }}
          selectFn = {(indexArea, id_area) => {
            setGlobalParamsState({
              ...globalParamsInitialState.Services,
              list: !areasListState.areas[indexArea].__services ? areasListState.areas[indexArea].__services.data : [],
              onAccept: (services) => services.forEach((service) => areasParams.servicesFn.addServiceRow(indexArea, service))
            });
            setUrl(process.env.API + 'services');
            setIsOpen({area: id_area})
          }}
        />

        {/*Items listst ------------------------------------------------------------------------ */}
        <div className='list_items'>
          <div className = "list_items__header">
            <p className = 'list_items__header__title'>Services:</p>
            <div className='list_items__header__buttons'>
              <Button className = 'list_items__header__buttons__btn add' onClick = {() => addNewService('unit_masurement', 'audio')}>
                <AddIcon/>
                <p>Add</p>
              </Button>
              <Button className = 'list_items__header__buttons__btn delete' disabled = {selectedServicesLength === 0} onClick = {removeSelectedServices}>
                <ClearIcon/>
                <p>Remove</p>
              </Button>
            </div>
          </div>

          <List
            {...servicesParams}
            selectable = {true}
            style = {{
              maxHeight: '50vh'
            }}
          />
        </div>

        {/*Items listst ------------------------------------------------------------------------ */}
        <div className='list_items'>
          <div className = "list_items__header">
            <p className = 'list_items__header__title'>Materials:</p>
            <div className='list_items__header__buttons'>
              <Button className = 'list_items__header__buttons__btn add' onClick = {() => addNewMaterial('unit_masurement', 'audio')}>
                <AddIcon/>
                <p>Add</p>
              </Button>
              <Button className = 'list_items__header__buttons__btn delete' disabled = {selectedMaterialsLength === 0} onClick = {removeSelectedMaterials}>
                <ClearIcon/>
                <p>Remove</p>
              </Button>
            </div>
          </div>

          <List
            {...materialsParams}
            selectable = {true}
            style = {{
              maxHeight: '50vh'
            }}
          />
        </div>

        {/*Action buttons ------------------------------------------------------------------------ */}
        <SpeedDial
          ariaLabel="SpeedDial basic example"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipOpen
              onClick = {action.function}
            />
          ))}
        </SpeedDial>

        <Button
          className = {'save-quote-button'}
          onClick = {getQuote}
        >
          <SaveIcon/>
        </Button>

        <SearchSelector
          title = {!!value ? value.title : null}
          {...searchSelectorParams}
          Item = {globalParamsState.item}
          list = {globalParamsState.list}
          selectExisting = {globalParamsState.selectExisting}
          onAccept = {globalParamsState.onAccept}
          unselectablePreselected = {true}
        />

        {/*Chooser unit masurement raw dialog ----------------------------------*/}
        <UnitMeasurementSelectableList
          onClose = {UMClose}
          isOpen = {UMIsOpen}
          onSelect = {changeUnitMasurementOfRowList}
          isLoading = {UMIsLoading}
          list = {UMList}
          message = {UMMessage}
        />
        {/*<Dialog
          onClose={()=> UMClose()}
          open={UMIsOpen}
        >
          <DialogTitle>Set backup account</DialogTitle>
          <MaterialList sx={{ pt: 0 }}>
            {UMList.map((el) => (
              <MaterialListItem
                button
                onClick={() => changeUnitMasurementOfRowList(el)}
                key={el.id}
                sx = {{fontSize: '1em'}}
              >
                {`${el.name} (${el.symbol})`}
              </MaterialListItem>
            ))}
          </MaterialList>
        </Dialog>*/}

        <Modal
          open = {areaForm.isOpen}
          ignoreErrors = {true}
          setOpen = {areaForm.setIsOpen}
          style = {{maxWidth: 'calc(500px + 1em)', width: '100%', padding: '1em'}}
          preventCloseOnScreen = {true}
        >
          <AreasFormQuotation
            {...areaForm}
            submit = {(newForm, oldForm) => {
              let newAreas = [];

              if(newForm.__3d1t === undefined) {
                if(!newForm.parents === true) return addArea(newForm);

                newAreas = areasListState.areas;

                newForm.parents.forEach((el) => newAreas.push({...newForm, parent: el, parents: undefined}));

                if(newForm.principal === true) newAreas.push({...newForm, parent: undefined, parents: undefined});
              } else {
                let parentsIndexes = {},
                    isUndefined = false;

                (newForm.parents ?? []).forEach((el, i) => parentsIndexes[i] = true);

                areasListState.areas.forEach((el, i) => {
                  if((el.id === null || el.id === undefined) && el.name === oldForm.name && el.description === oldForm.description && el.code === oldForm.code) {
                    if(!el.parent) isUndefined = true;

                    let exist = newForm.parents.some((parent, parentI) => {
                      let yes = (!!el.parent && parent.parents_ids === el.parent.parents_ids);

                      if(yes) delete parentsIndexes[parentI];

                      return yes;
                    });

                    if(!exist) {
                      if(!el.parent && newForm.principal === true) newAreas.push({ ...el, name: newForm.name, description: newForm.description, code: newForm.code });
                      return;
                    }

                    newAreas.push({ ...el, name: newForm.name, description: newForm.description, code: newForm.code });
                  } else {
                    newAreas.push(el);
                  }
                });

                if(!isUndefined && newForm.principal === true) {
                  newAreas.push({...newForm, parent: undefined, parents: undefined});
                }

                Object.keys(parentsIndexes).forEach(el => newAreas.push({...newForm, parent: newForm.parents[el], parents: undefined}));
                // updateArea(newForm.__3d1t, newForm)
              }

              setAreas(newAreas);
              // ((newForm.__3d1t === undefined) ? addArea(newForm) : updateArea(newForm.__3d1t, newForm))
            }}
          />
        </Modal>

        {/*<Modal
          open = {isOpenAreaModal}
          setOpen = {setIsOpenAreaModal}
          style = {{maxWidth: 'calc(100% - 1em)', width: '100%', height: 'calc(100% - 1em)', padding: '1em'}}
        >
          <TextEditor setState = {(text) => quotationChangeValue('contract', text)} />
        </Modal>*/}

        <InputAudioModal {...audioRecorderParams} onSave = {globalParamsState.audioSave}/>

        {/*<AudioPlayer/>*/}

        <ModalAudioPlayer
          isOpen = {audioPlayer.isOpen}
          url = {audioPlayer.url}
          onDelete = {audioPlayer.onDelete}
          setIsOpen = {(bool) => setAudioPlayer({...audioPlayer, isOpen: bool, url: bool === true ? audioPlayer.url : null})}
        />
      </MainContainer>

      <ErrorsModal
        errors = {errors.errors}
        isOpen = {errors.isOpen}
        title = 'Quotation'
        setIsOpen = {(val) => setErrors({...errors, isOpen: val})}
      />
    </Layout>
  )
}
