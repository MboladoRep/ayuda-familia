import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    // 1. PEDIMOS A LA IA (GROQ) QUE ESCRIBA EL ARTÍCULO
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Eres un experto redactor de artículos de familia. Genera un artículo breve (200 palabras) en español. Devuelve SOLO JSON: { 'titulo': '...', 'tema': '...', 'contenido': '...' }."
          },
          {
            role: "user",
            content: "Escribe un artículo útil sobre crianza, sueños o educación."
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const textoRespuesta = data.choices[0].message.content;
    const articuloData = JSON.parse(textoRespuesta);
    const { titulo, tema, contenido } = articuloData;

    // 2. GENERAMOS LA IMAGEN (AHORA USANDO UNSPLASH - FOTOS REALES)
    // Usamos el tema para buscar una foto real bonita. 
    // Añadimos 'sig=' para que cada vez sea una foto distinta.
    const terminoBusqueda = encodeURIComponent(tema || 'family');
    const imagenUrl = `https://source.unsplash.com/800x400/?${terminoBusqueda},family,happiness&sig=${Date.now()}`;

    // 3. GUARDAMOS EN SUPABASE
    const { error } = await supabase
      .from('articulos')
      .insert([{ 
        titulo, 
        contenido, 
        imagen_url: imagenUrl, 
        tema 
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true, articulo: articuloData });

  } catch (error) {
    console.error("Error generando artículo:", error);
    return NextResponse.json({ error: "Error al generar" }, { status: 500 });
  }
}
