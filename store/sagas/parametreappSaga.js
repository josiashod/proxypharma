import { takeLatest, put, call, all } from "redux-saga/effects"
import { Api } from "../../api/lienapi";

function* usernameVerification(payload) {

    try {

        const data = yield call(

            async () => {
                try {
                    const response = await fetch(Api + 'username/?username='+payload.value);
                    const data = await response.json();
                    return data;
                } catch (e) {
                    throw new Error(response.status);
                }
            }

        );

        if(data.Exist)
        {

            yield all([

                put({ type: "ModifUsernameVerif", value: {
                    username: true,
                    verifonline: false 
                } }),
        
                put({ type: "ModifSnack", value: {
                    val: true,
                    text: 'Pseudo non disponible',
                    duration: 2000
                } })

            ])
    
        }else
        {

            yield all([

                put({ type: "ModifUsernameVerif", value: {
                    username: false,
                    verifonline: false 
                } }),

                put({ type: "ModifSnack", value: {
                    val: true,
                    text: 'Pseudo disponible',
                    duration: 2000
                } })

            ])
    
        }

     

    } catch (e) {

        yield all([

            put({ type: "ModifUsernameVerif", value: {
                username: true,
                verifonline: false 
            } }),
    
            put({ type: "ModifSnack", value: {
                val: true,
                text: 'Erreur de connexion!',
                duration: 2000
            } })

        ])

    }

}






function* deconnexion(payload) {
    console.log('DECONEXION');
    yield all([
        put({ type: "logout"})
    ])
}


export const parametreappSaga = [
    takeLatest("USERNAME_VERIF", usernameVerification),
    takeLatest("DECONNEXION", deconnexion)
]
