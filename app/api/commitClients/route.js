import configs from "../apiConfigs";
import apiService from "../apiService";

/**
 * This endpoint is only for fetching, approving and committing the clients (IGA) as part of the initialisation process
 * @returns {Promise<Object>} - status response to be handled on client side
 */
export async function GET(){
    // Share variables at /api/apiConfigs.js
    const realm = configs.realm;
    const baseURL = configs.baseURL;

    // Fetch a master token with the default admin and password (set in the command for setting up keycloak) from the default keycloak admin-cli client
    const masterToken = await apiService.getMasterToken(baseURL);
    
    try {
        // Fetch the change requests to for signage upon approval
        const clientChangeRequestsFetch = await apiService.getClientsChangeRequests(baseURL, realm, masterToken);
        const clientsChangeRequests = clientChangeRequestsFetch.body;

        // Approve and commit each default client one at a time (forEach and map() shouldn't be used here)
        for (let i = 0; i < clientsChangeRequests.length; i++) {
            const changeRequest = clientsChangeRequests[i];

            // get token again as sign and commit might take longer then 1 min (default master token exp)
            const token = await apiService.getMasterToken(baseURL);
            const approveResult = await apiService.signChangeRequest(baseURL, realm, changeRequest, token);
            const commitResult = await apiService.commitChangeRequest(baseURL, realm, changeRequest, token);
        }

        return new Response(JSON.stringify({ok: true}), {status: 200});     
    } 
    catch (error) {
        return new Response(JSON.stringify({ok: false, error: "[commitClients Endpoint] " + error.message}), {status: 500})
    }
}
