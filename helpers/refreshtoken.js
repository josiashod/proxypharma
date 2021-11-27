var jwt_decode = require('jwt-decode')


const refreshTokenVerification = async (access_token, refresh_token) => {


    var decodedAccessToken = jwt_decode(access_token)
    console.log(decodedAccessToken);

    if (decodedAccessToken.exp < Date.now() / 1000) {


        var decodedRefreshToken = jwt_decode(refresh_token)

        if (decodedRefreshToken.exp < Date.now() / 1000) 
        {
            throw new Error('error dactualisation de session');
            // throw new Error('error dactualisation de session reseau');
        }
        else
        {

            return {
                statusToken: 'actualisé',
                newAccessTok: 'kjjjjjkk',
                newRefreshTok: 'jvgkvkjvk'
            }
        }


    } 
    else 
    {
        return {
            statusToken: 'bon'
        }
    }


}

export default refreshTokenVerification