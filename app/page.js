'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [edad, setEdad] = useState('');
  const [problema, setProblema] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const buscarAyuda = async () => {
    if (!edad || !problema) {
      alert('Por favor, selecciona edad y problema');
      return;
    }

    setCargando(true);
    setResultado(null);

    // Buscamos en Supabase
    let { data, error } = await supabase
      .from('guias')
      .select('*')
      .eq('edad', edad)
      .eq('problema', problema)
      .single();

    if (error) {
      console.log("No encontrado o error:", error);
      setResultado({ consejo_gratis: "Aún no tenemos guía para esto, pero estamos trabajando." });
    } else {
      setResultado(data);
    }
    
    setCargando(false);
  };

  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      {/* CABECERA */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Familia Ayuda</h1>
        <p className="text-gray-600">Encuentra soluciones rápidas para la crianza</p>
      </div>

      {/* FORMULARIO BUSCADOR */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Edad del niño/a</label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={edad} 
            onChange={(e) => setEdad(e.target.value)}
          >
            <option value="">Selecciona una edad</option>
            <option value="0-3 años">0 - 3 años</option>
            <option value="3-6 años">3 - 6 años</option>
            <option value="6-12 años">6 - 12 años</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Problema actual</label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={problema} 
            onChange={(e) => setProblema(e.target.value)}
          >
            <option value="">Selecciona un problema</option>
            <option value="Rabieta">Rabietas</option>
            <option value="Sueño">Problemas de sueño</option>
            <option value="Estudios">Dificultades de estudio</option>
            <option value="Comer">No quiere comer</option>
          </select>
        </div>

        <button 
          onClick={buscarAyuda}
          disabled={cargando}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
        >
          {cargando ? 'Buscando...' : 'Pedir Ayuda'}
        </button>
      </div>

      {/* RESULTADO Y MONETIZACIÓN */}
      {resultado && (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-green-500 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-800 mb-3">💡 Consejo Gratuito</h2>
          <p className="text-gray-700 mb-6 text-lg leading-relaxed">
            {resultado.consejo_gratis}
          </p>

          {/* ZONA DE DINERO: Solo aparece si hay producto en la BD */}
          {resultado.stripe_link && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg mt-4">
              <h3 className="font-bold text-amber-900 mb-2">🚀 Solución Completa Disponible</h3>
              <p className="text-amber-800 mb-4">
                ¿Necesitas más ayuda? Te recomendamos: <br/>
                <strong>{resultado.producto_nombre}</strong>
              </p>
              {/* AQUÍ VA TU LINK DE STRIPE */}
              <a href={resultado.stripe_link} target="_blank" rel="noopener noreferrer">
                <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition">
                  Obtener Recurso Premium
                </button>
              </a>
            </div>
          )}
        </div>
      )}

      <footer className="mt-8 text-gray-500 text-sm">
        Creado con amor para las familias.
      </footer>
    </main>
  );
}
