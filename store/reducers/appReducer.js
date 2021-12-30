import produce from "immer"


const pharmacy_state = {

  pharmacies: {
        'pharmacies': [],
        'on_call_pharmacies': [],
    },
  selected_pharmacy: null,
  waypoints: [],
  active_tab: 'pharmacies',
  moving: false,
  modal: false,
}

function appReducer(state = pharmacy_state, action) {

  let nextState

  switch (action.type) {

    case 'setPhamacies':

      nextState = produce(state, prev_state => {
        prev_state.pharmacies = action.value
      })

      return nextState || state;

    case 'setSelectedPharmacy':

      nextState = produce(state, prev_state => {
        prev_state.selected_pharmacy = action.value
      })

      return nextState || state;

    case 'setWaypoints':

      nextState = produce(state, prev_state => {
        prev_state.waypoints = action.value
      })

      return nextState || state;

    case 'setActiveTab':

        nextState = produce(state, prev_state => {
          prev_state.active_tab = action.value
        })
  
        return nextState || state;

    case 'setMoving':

      nextState = produce(state, prev_state => {
        prev_state.moving = action.value
      })

      return nextState || state;

    case 'setModal':

      nextState = produce(state, prev_state => {
        prev_state.modal = action.value
      })

      return nextState || state;

    default:

      return state
  }
}


export default appReducer;
