import configs from "../apiConfigs";
import apiService from "../apiService";

/**
 * This endpoint is only for creating the dummy users, with the demo user being the one to link the Tide account, 
 * log in and encrypt and decrypt their own date of birth and credit card.
 * @returns {Promise<Object>} - response status for creation of the dummy users
 */
export async function GET(){
    const realm = configs.realm;
    const baseURL = configs.baseURL;
    
    const masterToken = await apiService.getMasterToken(baseURL);
  
    // Dummy users to create
    // const users = [
    //     {username: "demouser", dob: "1980-01-01", cc: "4111111111111111"},
    //     {username: "testuser1", dob: "1990-02-02", cc: "378282246310005"},
    //     {username: "testuser2", dob: "2000-03-03", cc: "5555555555554444"},
    //     {username: "testuser3", dob: "2010-04-04", cc: "6011111111111117"},
    //     {username: "testuser4", dob: "2020-05-05", cc: "3530111333300000"},
    // ] 

    // The above data, but encrypted for demo purposes. Demo user shouldn't be able to decrypt this data
    // Demo user's data will only be encrypted when logged in for the first time to be decryptable.
    const users = [
        {username: "demouser", dob: "1980-01-01", cc: "4111111111111111"},
        {username: "testuser1", dob: "AQAAAAEAAAABRgAAACS9kjd+p9JceASgDD8ZJohTbp2q41G40hHCOPvNT0HPA5p1CJhWSDAThTALxE+sAh2BM5yA/HP+enjFpYtFiiZiFp13eEEIAAAAPO4baAAAAAAAAAAAQAAAAITlASV5Ik9pnCCTJFAv0dc4LYGNxZkbB1uyNGxSzWkQhMxwVglZy8xgS1G792wkXN1e/zfXBmBcZEC1B0zxlQs=", 
            cc: "AQAAAAEAAAABSwAAACCSi7I24CTr/Hl+ItmWQn1bY62fN6sqS7SmzBd+J5Iy4soIax1SUZdp1+IAjdAIskm0KhlMxCq+4DUdpH9jORtIsDJKB5vAJaQKOggAAAA/7htoAAAAAAAAAABAAAAAhLdDVwJAAxpENRDsCtiIbOmhPEX6s7VjFBaOcL7jM94ZPlpEJmaFVBzPQDol/EU2WSYuWX99UBzE3BTHGsnDAQ=="},
        {username: "testuser2", dob: "AQAAAAEAAAABRgAAAJEvRQaMRAC3vEiLJksOSJYCfa7u6QEDsP0RoS5JLIX39HS1yFGMILJemDUV1hQTDaFpoOtLiA8n7hNqwmhhObZyJm1d1LEIAAAAd+4baAAAAAAAAAAAQAAAAET3qUFdGaazKnem/kEqb9VLlMyGMQ8SbUXySF5QjtaNTz6qhBghRBdaE2Gg7+TO0qOc9nY1+7xbgyPciGS4NwU=", 
            cc: "AQAAAAEAAAABTAAAACqycDiT4bqTG3oaB4bUCUsQrFepIE5aw8sCIRp9b6H0dfS3i7dL5LySnTahDmvpmJSfcDigOBTtcelyXfIwi0MiTD5+v4w95st9zzMIAAAAeu4baAAAAAAAAAAAQAAAALMrQKyRIuN4DFkw+fctrddTyz/VO1LeD2ss6PasjuqOfUeipQ7bR46tHOF8wFwMCoI+ZMXMUsnJ7ychWT84xQg="},
        {username: "testuser3", dob: "AQAAAAEAAAABRgAAADs+CwUTIhxtdA3Or+9AUXWuiHYcOGbJjuD5E7fS8eAzbibsQxeOkymjwub/LSWFsNp6EapzO9IYzlgzuY2prQCalw1+Nw8IAAAAtu4baAAAAAAAAAAAQAAAANLuTIXynW7uAbNfjbjckAxnE77+nWn7q9LImnBJyqx5cPmoy/pckSUpsh4Yjv3BXu2Sny/W+51YjWjkx4amBQc=", 
            cc: "AQAAAAEAAAABTAAAAKddd6lHNaB2/WyIUBvoq+jXroNJuqBTlbekYgrMvXui1T3YbIlFKQ9TiNGnNIAJOLOk6pwqynnWxU/PlZd+5ySKq4HqOT6rs6Ol9NMIAAAAue4baAAAAAAAAAAAQAAAAOABiEUOTizbd0jShonezP24iVEJEmWh7kZLeqi3bUr877at0lO4M6LngbRMiETPOLK4C1qx3dVG6CbYTH58JwI="},
        {username: "testuser4", dob: "AQAAAAEAAAABRgAAAB74ttzmyNndjGI+oYlhL4A2tKQoXwee3TBW5ZW68YYmQ0FRurczlLqcMJZQIebp60K9rWFamDwxrr15ykaZ8gnH9f4+JioIAAAA5u4baAAAAAAAAAAAQAAAAE1CX13tdVRs+PFMfDdE8xMZIJ7CNpVCoOzEeUXLe5TIhPinUCzeum0WgbPILEdOggv0J6MrkXMO2u7GKoHDswU=", 
            cc: "AQAAAAEAAAABTAAAAGdzlaqTEYovmZZVJ3uQPWkxocc2pdoF5k9FNERne13ZveS0eBY3RJ1pc0X4hK6czAviPdATVZZeVgsV9qx5JLNoa5sA+eWRYrOA/TsIAAAA6e4baAAAAAAAAAAAQAAAAJ4vb86b8xR+AMPoeDftefkux+nIw9Xdu7bg3qwRENHt7y3oY6WmY53JlOOmoXAJnzoZgzA/9LgKIqkk4yf66Ac="},
    ] 

    try {
        // Create the users
        for (let i=0; i < users.length; i++){
            const createUserResult = await apiService.createUser(baseURL, realm, masterToken, users[i].username, users[i].dob, users[i].cc);
        }

        return new Response(JSON.stringify({ok: true}), {status: 201}); 
        
    } 
    catch (error) {
        return new Response(JSON.stringify({ok: false, error: "[createUsers Endpoint] " + error.message}), {status: 500});
    }
}
