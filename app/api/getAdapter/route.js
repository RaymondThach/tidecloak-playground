import configs from "../apiConfigs";
import settings from "/test-realm.json";
import fs from "fs";
import path from "path";
import apiService from "../apiService";

/**
 * Fetches adapter config from Keycloak and writes it to data/tidecloak.json.
 * If the file is empty, the frontend shows the initial setup screen.
 */
export async function GET() {
  const realm = configs.realm;
  const baseURL = configs.baseURL;
  const clientName = settings.clients[0].clientId;

  // Full path to the writable config file
  const filePath = path.join(process.cwd(), "data", "tidecloak.json");

  try {
    const masterToken = await apiService.getMasterToken(baseURL);

    const getClientIDResult = await apiService.getClientID(
      baseURL,
      realm,
      clientName,
      masterToken
    );
    const clientID = getClientIDResult.body;

    const getClientAdapterResult = await apiService.getClientAdapter(
      baseURL,
      realm,
      clientID,
      masterToken
    );
    const configsString = getClientAdapterResult.body;

    // Write the adapter config to /data/tidecloak.json
    fs.writeFileSync(filePath, configsString);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: getClientAdapterResult.status }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "[getAdapter Endpoint] " + error.message
      }),
      { status: 500 }
    );
  }
}
