import produce from "immer"

const token_state = {
    access_token: '',
    refresh_token: ''   
}

function authReducer (state = token_state, action ) {

    let nextState

    switch (action.type) {

        case 'setToken':
        
            nextState = produce(state, prev_state => {
              prev_state.access_token = action.value.access_token
              prev_state.refresh_token = action.value.refresh_token
            })

        return nextState || state;


        default:

            return state
    }
}


export default authReducer;
