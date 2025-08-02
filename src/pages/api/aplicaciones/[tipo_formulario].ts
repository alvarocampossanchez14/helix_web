
export const prerender = false;

import type { APIRoute } from 'astro';
import db from '../../../db';

export const GET: APIRoute = async ({ params }) => {
    try {
        const { tipo_formulario } = params;

        if (!tipo_formulario) {
            return new Response(JSON.stringify({ error: 'Falta el tipo de formulario' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const [rows] = await db.execute(
            'SELECT * FROM aplicaciones WHERE tipo_formulario = ? ORDER BY fecha_envio DESC',
            [tipo_formulario]
        );

        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error(`Error al obtener postulaciones de tipo ${params.tipo_formulario}:`, error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};


export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const id = params.tipo_formulario; 
        const { estado } = await request.json();

        if (estado !== 'aceptada' && estado !== 'denegada') {
            return new Response(JSON.stringify({ error: 'Estado inválido' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const [result] = await db.execute(
            'UPDATE aplicaciones SET estado = ? WHERE id = ?',
            [estado, id]
        );

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Aplicación no encontrada' }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: 'Estado actualizado correctamente' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al actualizar la aplicación:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};