import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { mensaje } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        respuesta: "Error: Falta la GROQ_API_KEY en Vercel." 
      });
    }

    // Usamos el modelo actualizado
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // <--- MODELO ACTUALIZADO
        messages: [
          {
            role: "system",
            content: "Eres un asistente empático y experto en crianza familiar. Responde siempre en español, de forma breve, cálida y útil."
          },
          {
            role: "user",
            content: mensaje
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
       console.error("Error Groq:", data.error);
       return NextResponse.json({ respuesta: `Error de la IA: ${data.error.message}` });
    }

    if (data.choices && data.choices[0].message.content) {
      return NextResponse.json({ respuesta: data.choices[0].message.content });
    } else {
      return NextResponse.json({ respuesta: "La IA no ha respondido." });
    }

  } catch (error) {
    console.error("Error servidor:", error);
    return NextResponse.json({ respuesta: "Error interno." }, { status: 500 });
  }
}
