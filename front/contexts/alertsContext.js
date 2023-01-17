import { createContext, useState } from 'react';
import AlertNotification from '../components/AlertNotification';

const alertsContext = createContext();

const initialAlerts=[];

const AlertsContextProvider=({children})=>{
    const [alerts, setAlerts]=useState(initialAlerts);
    let count=-1;

    const getKey=()=>{
        count++;
        return Date.now().toString()+count.toString();
    }

    const closeAlert=(key)=>{
        setAlerts(alerts.filter(el=> el.key!==key));
    }

    const addAlert=({title, message, type, onCancel, cancelButton, titleCancelButton, onAccept, acceptButton, titleAcceptButton, input})=>{
        let key=getKey();
        setAlerts([
            ...alerts,
            {
                key,
                title,
                message,
                type,
                onCancel,
                acceptButton,
                onAccept,
                titleAcceptButton,
                cancelButton,
                titleCancelButton,
                input,
                close:()=> closeAlert(key)
            }
        ]);

        setTimeout(()=>close(key), 10000);
    };

    return <alertsContext.Provider value={{ alerts, addAlert }}>
        {children}
        {alerts.map(el => <AlertNotification {...el}/>)}
    </alertsContext.Provider>;
};

export {AlertsContextProvider};
export default alertsContext;