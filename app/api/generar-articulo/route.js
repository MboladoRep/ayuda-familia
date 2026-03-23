import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    // Lista de fotos reales centradas en familia y niños
    const fotosCalidad = [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800', // Familia jugando
      'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800', // Padres e hijo
      'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800', // Niño leyendo
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800', // Niños corriendo
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800', // Bebé durmiendo
      'https://images.unsplash.com/photo-1581952976147-5a2d15560349?w=800'  // Cocinando
    ];
    
    const imagenSeleccionada = fotosCalidad[Math.floor(Math.random() * fotosCalidad.length)];

    // NUEVAS INSTRUCCIONES: Enfocadas en CRIANZA PRÁCTICA
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
            content: "Eres un experto redactor de una revista de padres y madres. Tu objetivo es dar consejos PRÁCTICOS y reales sobre crianza. Temas permitidos: rutinas de sueño, ideas de cenas para niños, gestión de rabietas, juegos en familia, límites de pantalla, autonomía infantil, consejos para bebés, actividades de fin de semana. Prohibido escribir sobre psicología profunda o emociones abstractas. Escribe de forma cercana y útil."
          },
          {
            role: "user",
            content: "Escribe un consejo práctico que sirva para hoy mismo. Título atractivo y solución paso a paso. Formato JSON: { 'titulo': '...', 'tema': '...', 'contenido': '...' }."
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const textoRespuesta = data.choices[0].message.content;
    const articuloData = JSON.parse(textoRespuesta);
    const { titulo, tema, contenido } = articuloData;

    const { error } = await supabase
      .from('articulos')
      .insert([{ 
        titulo, 
        contenido, 
        imagen_url: imagenSeleccionada, 
        tema 
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true, articulo: articuloData });

  } catch (error) {
    console.error("Error generando artículo:", error);
    return NextResponse.json({ error: "Error al generar" }, { status: 500 });
  }
}
