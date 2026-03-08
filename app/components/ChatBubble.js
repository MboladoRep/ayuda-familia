'use client';
import { useState } from 'react';

export default function ChatBubble() {
  const [abierto, setAbierto] = useState(false);
  const [input, setInput] = useState('');
  const [mensajes, setMensajes] = useState([
    { rol: 'bot', texto: '¡Hola! Soy tu asistente de crianza. ¿En qué te puedo ayudar ahora?' }
  ]);
  const [cargando, setCargando] = useState(false);

  const enviarMensaje = async () => {
    if (!input.trim()) return;

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
    } catch (error) {
      setMensajes(prev => [...prev, { rol: 'bot', texto: 'Error al conectar con el asistente.' }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {abierto ? (
        <div className="w-80 h-96 bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center">
            <span className="text-white font-bold">Asistente Familiar</span>
            <button onClick={() => setAbierto(false)} className="text-white font-bold">X</button>
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
          </div>
          
          {/* Input */}
          <div className="p-2 border-t flex gap-2 bg-white">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
              placeholder="Escribe tu duda..." 
              className="flex-1 border rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-1"
            />
            <button onClick={enviarMensaje} className="bg-blue-600 text-white rounded-full px-3 font-bold text-sm hover:bg-blue-700">➤</button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setAbierto(true)} 
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition transform hover:scale-110"
        >
          💬
        </button>
      )}
    </div>
  );
}
