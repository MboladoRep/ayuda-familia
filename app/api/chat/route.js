import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { mensaje } = await request.json();

    // Usamos un modelo gratuito y rápido de Hugging Face
    // NO ponemos la API Key aquí directamente, la leemos de las variables de entorno
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `<s>[INST] Eres un asistente empático y experto en crianza familiar. Responde de forma breve y útil a esta consulta: ${mensaje} [/INST]`,
          options: { wait_for_model: true },
        }),
      }
    );

    const data = await response.json();
    
    // A veces la API devuelve un array, a veces un objeto de error
    let respuestaIA = "Lo siento, el asistente está descansando ahora. Intenta más tarde.";
    if (Array.isArray(data) && data[0]?.generated_text) {
        // Limpiamos la respuesta para que no repita el prompt
        respuestaIA = data[0].generated_text.split('[/INST]')[1] || data[0].generated_text;
    } else if (data.error) {
        console.error("Error HF:", data.error);
        respuestaIA = "El servicio de IA está muy ocupado ahora mismo. Vuelve en unos segundos.";
    }

    return NextResponse.json({ respuesta: respuestaIA });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json({ respuesta: "Error interno del servidor." }, { status: 500 });
  }
}
