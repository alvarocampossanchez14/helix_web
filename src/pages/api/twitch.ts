import type { APIRoute } from 'astro';


const streamerIds = ['743037550', '509952496'];

const TWITCH_CLIENT_ID = import.meta.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = import.meta.env.TWITCH_CLIENT_SECRET;

const GAME_TITLE_FILTER = "Helix ST ";


async function getTwitchAccessToken(clientId: string, clientSecret: string) {
    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
        method: 'POST'
    });
    const data = await response.json();
    return data.access_token;
}


export const GET: APIRoute = async () => {
    try {
        if (streamerIds.length === 0) {
            return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        
        // Lógica para obtener streams de Twitch
        const twitchAccessToken = await getTwitchAccessToken(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
        
        const streamsResponse = await fetch(`https://api.twitch.tv/helix/streams?user_id=${streamerIds.join('&user_id=')}`, {
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${twitchAccessToken}`
            }
        });

        const streamsData = await streamsResponse.json();

        const filteredStreams = streamsData.data.filter(stream => 
            stream.title.toLowerCase().includes(GAME_TITLE_FILTER.toLowerCase())
        );
        
        return new Response(JSON.stringify(filteredStreams), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error("Error en la ruta de API de Twitch:", error);
        return new Response(JSON.stringify({ error: "Error al obtener los streams" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};