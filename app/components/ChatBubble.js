'use client';
import { useState, useEffect } from 'react';

export default function ChatBubble({ isOpen, setIsOpen }) {
  const [input, setInput] = useState('');
  const [mensajes, setMensajes] = useState([
    { rol: 'bot', texto: '¡Hola! Soy tu asistente de crianza. ¿En qué te puedo ayudar? (Tienes 5 consultas gratis)' }
  ]);
  const [cargando, setCargando] = useState(false);
  const [contador, setContador] = useState(0); // Contador de mensajes
  const LIMITE_GRATIS = 5;
  const STRIPE_APOYO = "https://buy.stripe.com/9B6aEX9Ilg4v7xA3Scffy00"; // PEGA AQUÍ TU LINK DE APOYO

  useEffect(() => {
    // Recuperamos el contador si el usuario recarga (opcional, por simplicidad lo reiniciamos aquí)
    // Por ahora lo mantenemos simple: se resetea al recargar página.
  }, []);

  const enviarMensaje = async () => {
    if (!input.trim()) return;

    // Verificamos límite
    if (contador >= LIMITE_GRATIS) {
      alert('Has alcanzado el límite de consultas gratuitas. ¡Apoya el proyecto para seguir chatando!');
      return;
    }

    const nuevoMensaje = { rol: 'user', texto: input };
    setMensajes([...mensajes, nuevoMensaje]);
    setInput('');
    setCargando(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: input }),
      });
      const data = await res.json();
      
      setMensajes(prev => [...prev, { rol: 'bot', texto: data.respuesta }]);
      setContador(prev => prev + 1); // Sumamos 1 al contador
    } catch (error) {
      setMensajes(prev => [...prev, { rol: 'bot', texto: 'Error al conectar.' }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center">
            <div>
              <span className="text-white font-bold">Asistente IA</span>
              {/* Barra de progreso del límite */}
              <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                <div className="bg-white h-1.5 rounded-full" style={{ width: `${(contador / LIMITE_GRATIS) * 100}%` }}></div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white font-bold text-xl leading-none">&times;</button>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${m.rol === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-white border text-gray-800'}`}>
                  {m.texto}
                </div>
              </div>
            ))}
            {cargando && <div className="text-center text-xs text-gray-400">Escribiendo...</div>}
            
            {/* Mensaje de Límite Alcanzado */}
            {contador >= LIMITE_GRATIS && (
              <div className="bg-amber-100 border border-amber-300 p-3 rounded-lg text-center text-sm text-amber-800">
                <p className="font-bold">¡Límite alcanzado!</p>
                <p className="my-2">Para seguir usando la IA y apoyar el desarrollo, invítanos a un café.</p>
                <a href={STRIPE_APOYO} target="_blank" rel="noopener noreferrer">
                  <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-4 rounded-full text-xs mt-1">
                    Apoyar Proyecto (3€)
                  </button>
                </a>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="p-2 border-t flex gap-2 bg-white">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
              placeholder="Escribe tu duda..." 
              className="flex-1 border rounded-full px-4 py-1 text-sm focus:outline-none"
              disabled={contador >= LIMITE_GRATIS} // Bloquear input si llega al límite
            />
            <button onClick={enviarMensaje} disabled={cargando || contador >= LIMITE_GRATIS} className="bg-blue-600 text-white rounded-full px-3 font-bold text-sm hover:bg-blue-700 disabled:opacity-50">➤</button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition transform hover:scale-110 relative"
        >
          💬
          {contador > 0 && contador < LIMITE_GRATIS && (
             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
               {LIMITE_GRATIS - contador}
             </span>
          )}
        </button>
      )}
    </div>
  );
}
