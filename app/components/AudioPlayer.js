'use client';
import { useState } from 'react';

export default function AudioPlayer({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (!text) return;

    // Si ya está reproduciendo, paramos
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Creamos el objeto de voz
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; // Idioma español
    utterance.rate = 0.9; // Velocidad un poco más lenta para claridad
    
    // Evento cuando termina de hablar
    utterance.onend = () => {
      setIsPlaying(false);
    };

    // Iniciar voz
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button 
      onClick={handlePlay} 
      className={`w-full mt-4 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-md ${
        isPlaying 
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {isPlaying ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
          Detener Audio
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Escuchar Artículo
        </>
      )}
    </button>
  );
}
