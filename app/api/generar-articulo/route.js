import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Conexión directa a Supabase (usa tus variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    // 1. PEDIMOS A LA IA (GROQ) QUE ESCRIBA EL ARTÍCULO
    // Le pedimos que devuelva JSON para poder separar título y contenido
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
            content: "Eres un experto redactor de artículos de familia y crianza. Tu tarea es generar un artículo breve (300 palabras) en español sobre un tema interesante para padres. Devuelve SOLO un objeto JSON con el formato: { 'titulo': '...', 'tema': '...', 'contenido': '...' }."
          },
          {
            role: "user",
            content: "Genera un artículo aleatorio sobre un problema común de crianza o un consejo útil."
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const textoRespuesta = data.choices[0].message.content;
    
    // Convertimos el texto JSON a objeto
    const articuloData = JSON.parse(textoRespuesta);
    const { titulo, tema, contenido } = articuloData;

    // 2. GENERAMOS LA IMAGEN AUTOMÁTICA (POLLINATIONS.AI - GRATIS)
    // Creamos una URL con el tema para generar una imagen única
    const promptImagen = `Familia feliz, ${tema}, estilo ilustración acuarela`;
    const imagenUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptImagen)}?width=800&height=400&nologo=true`;

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
