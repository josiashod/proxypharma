import { all } from 'redux-saga/effects';
import { parametreappSaga } from "./parametreappSaga"



export function* rootSaga() {
  yield all([
    ...parametreappSaga
  ])
}