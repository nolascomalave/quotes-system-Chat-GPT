import React, {useContext} from 'react';

// Components:
import AlertNotification from '../AlertNotification';

// Contexts:
import alertsContext from '../../contexts/alertsContext';

export default function AlertsSection(){
    const {alerts, addAlert} = useContext(alertsContext);

    return (
        <div id='alerts-section'>
            {/* {alerts.map(el => <AlertNotification {...el}/>)} */}
        </div>
    );
}