import type { APIRoute } from 'astro';

// --- CONFIGURACIÓN ---
const DISCORD_BOT_TOKEN = import.meta.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = import.meta.env.DISCORD_GUILD_ID;
const STREAMER_ROLE_ID = import.meta.env.STREAMER_ROLE_ID;

// Función para obtener la lista de miembros de tu servidor de Discord
async function getDiscordMembers() {
    const response = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members?limit=1000`, {
        headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Error al obtener miembros de Discord: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export const GET: APIRoute = async () => {
    try {
        const discordMembers = await getDiscordMembers();
        
        // Filtra los miembros que tienen el rol de streamer
        const streamerMemberIds = discordMembers
            .filter(member => member.roles.includes(STREAMER_ROLE_ID))
            .map(member => member.user.id); // Devuelve solo los IDs de usuario

        return new Response(JSON.stringify(streamerMemberIds), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error("Error en la ruta de API de roles de streamer:", error);
        return new Response(JSON.stringify({ error: "Error al obtener los IDs de los streamers" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};