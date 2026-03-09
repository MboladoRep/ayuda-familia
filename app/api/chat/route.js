import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { mensaje } = await request.json();

    // Usamos la variable de entorno (Hemos reutilizado el nombre HF_API_KEY en Vercel por comodidad)
    const apiKey = process.env.HF_API_KEY || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ respuesta: "Falta configurar la API Key en Vercel." });
    }

    // Llamada a la API de GROQ (Compatibilidad OpenAI)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Modelo rápido y gratuito
        messages: [
          {
            role: "system",
            content: "Eres un asistente empático y experto en crianza familiar. Responde siempre en español, de forma breve, cálida y útil. No uses listas complejas, usa párrafos cortos."
          },
          {
            role: "user",
            content: mensaje
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0].message.content) {
      return NextResponse.json({ respuesta: data.choices[0].message.content });
    } else {
      console.error("Error en Groq:", data);
      return NextResponse.json({ respuesta: "El asistente no ha podido responder ahora. Inténtalo de nuevo." });
    }

  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json({ respuesta: "Error de conexión con la IA." }, { status: 500 });
  }
}