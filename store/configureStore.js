import {createStore, applyMiddleware, combineReducers} from 'redux'
import { persistReducer } from 'redux-persist'
import createSagaMiddleware from "redux-saga"
import ExpoFileSystemStorage from "redux-persist-expo-filesystem"
import createSecureStore from "redux-persist-expo-securestore"


//import reducer
import authReducer from './reducers/authReducer'
import parameterReducer from './reducers/parameterReducer'


//import saga
import {rootSaga} from './sagas/indexSaga'
import appReducer from './reducers/appReducer'



const configureStore = () => {

    const secure_storage = createSecureStore();

    const secure_persist_config = {
        key: "secureapp",
        storage: secure_storage
    };

    // Non-secure (ExpoFileSystemStorage) storage
    const root_persist_config = {
        key: 'parametreapp',
        storage: ExpoFileSystemStorage,
        blacklist: ['splash']
    }

    // Non-secure (ExpoFileSystemStorage) storage
    const pharmacy_persist_config = {
        key: 'pharmacyapp',
        storage: ExpoFileSystemStorage,
        blacklist: [
            'pharmacies',
            'waypoints',
            'selected_pharmacy',
            'active_tab',
            'moving',
            'modal',
        ]
    }



    const saga_middleware = createSagaMiddleware();

    const store = createStore(
        combineReducers({
            parameterReducer: persistReducer(root_persist_config, parameterReducer),
            authReducer: persistReducer(secure_persist_config, authReducer),
            appReducer: persistReducer(pharmacy_persist_config, appReducer)
        }),  
        applyMiddleware(saga_middleware)
    );
  
    saga_middleware.run(rootSaga);
  
    return store;
};
  
export default configureStore;


