export const prerender = false;

import type { APIRoute } from 'astro';
import db from '../../db'; 

const SESSION_COOKIE_NAME = import.meta.env.SESSION_COOKIE_NAME;;

export const POST: APIRoute = async ({ request, cookies }) => {
    const accessToken = cookies.get(SESSION_COOKIE_NAME)?.value;

    if(!accessToken) {
        return new Response(JSON.stringify({
            message: 'Usuario no autenticado',
        }), { status: 401});
    }

    let discordId = null;

    try {
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            return new Response(JSON.stringify({
                message: 'Error: La sesión ha expirado. Por favor, vuelve a iniciar sesión.',
            }), { status: 403 });
        }

        const userData = await userResponse.json();
        discordId = userData.id;

    } catch (e) {
        console.error('Error al obtener el ID de Discord:', e);
        return new Response(JSON.stringify({
            message: 'Error interno del servidor al procesar la sesión.',
        }), { status: 500 });
    }

    try {
        const data = await request.json();
        const { tipo_formulario, nombre, otros_datos } = data;

        if (!tipo_formulario || !nombre) {
            return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const [result] = await db.execute(
            'INSERT INTO aplicaciones (tipo_formulario, nombre, discord_id, otros_datos) VALUES (?, ?, ?, ?)',
            [tipo_formulario, nombre, discordId || null, JSON.stringify(otros_datos || {})]
        );

        return new Response(JSON.stringify({ id: result.insertId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error al guardar la aplicación:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};