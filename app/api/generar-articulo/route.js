import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    // Recibimos el tema o prompt personalizado del frontend
    const body = await request.json();
    const { tema, prompt } = body;

    const fotosCalidad = [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
      'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800',
      'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800',
      'https://images.unsplash.com/photo-1581952976147-5a2d15560349?w=800'
    ];
    const imagenSeleccionada = fotosCalidad[Math.floor(Math.random() * fotosCalidad.length)];

    // Lógica para construir el mensaje del usuario
    let userMessage = "Escribe un consejo práctico que sirva para hoy mismo. Título atractivo y solución paso a paso. Formato JSON: { 'titulo': '...', 'tema': '...', 'contenido': '...' }.";
    
    if (prompt) {
      // Si hay prompt personalizado, tiene prioridad
      userMessage = `${prompt}. Formato JSON requerido: { 'titulo': '...', 'tema': '...', 'contenido': '...' }.`;
    } else if (tema) {
      // Si hay tema seleccionado
      userMessage = `Escribe un artículo práctico sobre "${tema}". Formato JSON: { 'titulo': '...', 'tema': '...', 'contenido': '...' }.`;
    }

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
            content: "Eres un redactor experto en una revista de padres. Tu objetivo es dar consejos PRÁCTICOS y reales sobre crianza. Temas: rutinas, comida, juegos, límites, autonomía. Evita psicología abstracta. Escribe de forma cercana y útil."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
        throw new Error("La IA no respondió correctamente");
    }

    const textoRespuesta = data.choices[0].message.content;
    const articuloData = JSON.parse(textoRespuesta);
    const { titulo, contenido } = articuloData;
    const temaFinal = tema || articuloData.tema || "General";

    const { error } = await supabase
      .from('articulos')
      .insert([{ 
        titulo, 
        contenido, 
        imagen_url: imagenSeleccionada, 
        tema: temaFinal
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true, articulo: articuloData });

  } catch (error) {
    console.error("Error generando artículo:", error);
    return NextResponse.json({ error: "Error al generar" }, { status: 500 });
  }
}
