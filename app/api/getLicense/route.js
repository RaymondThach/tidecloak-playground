import configs from "../apiConfigs";
import apiService from "../apiService";

/**
 * This endpoint is only for activating the IDP license with a default email using a custom Tide endpoint.
 * Called after the createRealm endpoint to prepare for IGA setup.
 * @returns {Promise<Object>} - status object with responses  based on acivation of IDP license.
 */
export async function GET(){

    // Shared variables from /api/apiConfigs.js
    const realm = configs.realm;
    const baseURL = configs.baseURL;

    // Fetch a master token with the default admin and password (set in the command for setting up keycloak) from the default keycloak admin-cli client
    const masterToken = await apiService.getMasterToken(baseURL);

    try {
        // Activate the IDP with the default email
        const result = await apiService.activateIDPLicense(baseURL, realm, masterToken);

        if (result.status === 204){
            return new Response(null, {status: result.status})
        }
        else {
            return new Response(JSON.stringify({...result}), {status: result.status}); 
        }
    } 
    catch (error) {
        return new Response(JSON.stringify({ok: false, error: "[getLicense Endpoint] " + error.message}), {status: 500});
    }
}