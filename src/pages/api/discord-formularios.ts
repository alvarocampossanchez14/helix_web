// src/pages/api/discord/send-application-notification.ts
import type { APIRoute } from 'astro';

const DISCORD_WEBHOOK_URL = import.meta.env.WEBHOOK_URL;

export const POST: APIRoute = async ({ request }) => {
    if (!DISCORD_WEBHOOK_URL) {
        console.error("DISCORD_STAFF_WEBHOOK no está configurado en .env");
        return new Response(JSON.stringify({ message: "Error: Webhook no configurado." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const data = await request.json();
        const { tipo_formulario, nombre, discord_id, otros_datos } = data;

        if (!tipo_formulario || !nombre || !discord_id) {
            return new Response(JSON.stringify({ error: 'Faltan campos obligatorios para el webhook' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const dynamicFields = Object.entries(otros_datos || {}).map(([key, value]) => ({
            name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            value: value?.toString() || 'No especificado',
        }));

        const discordPayload = {
            embeds: [{
                title: `Nueva Postulación: ${tipo_formulario.replace(/_/g, ' ')}`,
                description: `**Nombre:** ${nombre}\n**ID de Discord:** <@${discord_id}>`,
                color: 3447003, 
                fields: dynamicFields,
                timestamp: new Date().toISOString(),
                footer: { text: "Sistema de Postulaciones Helix" }
            }]
        };

        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        });

        if (!response.ok) {
            console.error(`Error al enviar mensaje a Discord: ${response.status} ${response.statusText}`);
            return new Response(JSON.stringify({ message: "Error al enviar la notificación a Discord." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ message: "Notificación de Discord enviada." }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Error al procesar el Webhook de Discord:", error);
        return new Response(JSON.stringify({ message: "Error interno del servidor." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
