// src/pages/api/aplicaciones/[tipo_formulario].ts

// Configuración para que el servidor maneje esta ruta.
export const prerender = false;

import type { APIRoute } from 'astro';
import db from '../../../db';

/**
 * Método GET:
 * Obtiene todas las aplicaciones que coinciden con un tipo de formulario específico.
 * URL de ejemplo: /api/aplicaciones/marketing
 */
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
        console.error(`Error al obtener aplicaciones de tipo ${params.tipo_formulario}:`, error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
