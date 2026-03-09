import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { mensaje } = await request.json();

    // Buscamos específicamente la variable GROQ_API_KEY
    const apiKey = process.env.GROQ_API_KEY;

    // Si no encontramos la clave, avisamos
    if (!apiKey) {
      console.error("Error: Falta GROQ_API_KEY en Vercel");
      return NextResponse.json({ 
        respuesta: "Error de configuración: No se ha encontrado la API Key de Groq en Vercel. Asegúrate de llamarla GROQ_API_KEY y hacer Redeploy." 
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "model: "llama-3.1-8b-instant"",
        messages: [
          {
            role: "system",
            content: "Eres un experto en crianza. Responde en español, breve y empático."
          },
          {
            role: "user",
            content: mensaje
          }
        ]
      })
    });

    const data = await response.json();

    // Si Groq nos da un error (ej: clave mal copiada)
    if (data.error) {
       console.error("Error devuelto por Groq:", data.error);
       return NextResponse.json({ respuesta: `Error de la IA: ${data.error.message}` });
    }

    if (data.choices && data.choices[0].message.content) {
      return NextResponse.json({ respuesta: data.choices[0].message.content });
    } else {
      return NextResponse.json({ respuesta: "La IA no ha devuelto texto." });
    }

  } catch (error) {
    console.error("Error general:", error);
    return NextResponse.json({ respuesta: "Error de conexión en el servidor." }, { status: 500 });
  }
}
