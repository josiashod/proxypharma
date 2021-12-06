import produce from "immer"


const parameter_state = {

  first_use: true,

  connected: false,

  splash: true,


  // snackbar: {
  //   val: false,
  //   text: '',
  //   duration: 2000
  // },

}

function parameterReducer(state = parameter_state, action) {

  let nextState

  switch (action.type) {

    case 'setFirstUse':

      nextState = produce(state, prev_state => {
        prev_state.first_use = action.value
      })

      return nextState || state;


    case 'setConnected':

      nextState = produce(state, prev_state => {
        prev_state.connected = action.value
      })

      return nextState || state;

    case 'setSplash':

      nextState = produce(state, prev_state => {
        prev_state.splash = action.value
      })

      return nextState || state;
  
  

    // case 'ModifSnack':

    //   nextState = produce(state, prev_state => {
    //     prev_state.snackbar = action.value
    //   })

    //   return nextState || state;


    case 'logout':

      nextState = produce(state, prev_state => {
        prev_state.connected = false
        // prev_state.chargement = false
        // prev_state.chargementcamerascan = false
      })

      return nextState || state;


    default:

      return state
  }
}


export default parameterReducer;
