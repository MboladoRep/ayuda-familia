'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import dynamic from 'next/dynamic';

// Importamos los componentes
import ChatBubble from './components/ChatBubble';

// Cargamos el mapa solo en el cliente
const Mapa = dynamic(() => import('./components/Mapa'), { ssr: false });

export default function Home() {
  const [hijos, setHijos] = useState([{ id: Date.now(), edad: '', problema: '' }]);
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [recursos, setRecursos] = useState([]);
  const [verMapa, setVerMapa] = useState(false);

  useEffect(() => {
    async function cargarRecursos() {
      const { data } = await supabase.from('recursos_mapa').select('*');
      if (data) setRecursos(data);
    }
    cargarRecursos();
  }, []);

  const agregarHijo = () => {
    setHijos([...hijos, { id: Date.now(), edad: '', problema: '' }]);
  };

  const quitarHijo = (id) => {
    setHijos(hijos.filter(h => h.id !== id));
  };

  const actualizarHijo = (id, campo, valor) => {
    setHijos(hijos.map(h => h.id === id ? { ...h, [campo]: valor } : h));
  };

  const buscarAyuda = async () => {
    const hijosValidos = hijos.filter(h => h.edad && h.problema);
    if (hijosValidos.length === 0) {
      alert('Por favor, indica la edad y problema de al menos un hijo');
      return;
    }

    setCargando(true);
    setResultados([]);

    const promesasBusqueda = hijosValidos.map(async (hijo) => {
      const { data, error } = await supabase
        .from('guias')
        .select('*')
        .eq('edad', hijo.edad)
        .eq('problema', hijo.problema)
        .single();

      if (error || !data) {
        return { 
          status: 'no_encontrado', 
          edadInput: hijo.edad, 
          problema: hijo.problema, 
          consejo_gratis: 'No hay guía específica. Usa el chat de IA abajo a la derecha.' 
        };
      }
      return { status: 'ok', ...data, edadInput: hijo.edad };
    });

    const resultadosObtenidos = await Promise.all(promesasBusqueda);
    setResultados(resultadosObtenidos);
    setCargando(false);
  };

  return (
    <main className="min-h-screen bg-blue-50">
      
      {/* SECCIÓN BUSCADOR */}
      <div className="flex flex-col items-center justify-center p-8 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Familia Ayuda</h1>
          <p className="text-gray-600">Tu red de apoyo para la crianza</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">¿Qué pasa en casa?</h2>
          
          {hijos.map((hijo, index) => (
            <div key={hijo.id} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
              {hijos.length > 1 && (
                <button 
                  onClick={() => quitarHijo(hijo.id)} 
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-sm font-bold"
                >
                  X
                </button>
              )}
              
              <p className="font-bold text-gray-800 mb-3">Hijo/a #{index + 1}</p>
              
              <div className="grid grid-cols-1 gap-4">
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={hijo.edad}
                  onChange={(e) => actualizarHijo(hijo.id, 'edad', e.target.value)}
                >
                  <option value="">Edad</option>
                  <option value="0-3 años">0 - 3 años</option>
                  <option value="3-6 años">3 - 6 años</option>
                  <option value="6-12 años">6 - 12 años</option>
                </select>

                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={hijo.problema}
                  onChange={(e) => actualizarHijo(hijo.id, 'problema', e.target.value)}
                >
                  <option value="">Problema</option>
                  <option value="Rabieta">Rabietas</option>
                  <option value="Sueño">Problemas de sueño</option>
                  <option value="Estudios">Dificultades de estudio</option>
                  <option value="Comer">No quiere comer</option>
                </select>
              </div>
            </div>
          ))}

          <button onClick={agregarHijo} className="w-full mb-6 text-blue-600 font-semibold py-2 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50">
            + Añadir otro hijo/a
          </button>

          <button onClick={buscarAyuda} disabled={cargando} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            {cargando ? 'Buscando...' : 'Buscar Ayuda'}
          </button>
        </div>

        {/* RESULTADOS */}
        {resultados.length > 0 && (
          <div className="w-full max-w-lg space-y-6 mb-8">
            {resultados.map((res, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800">Edad: {res.edadInput}</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Ayuda</span>
                </div>
                
                <p className="text-gray-700 mb-4 text-lg">{res.consejo_gratis}</p>

                {res.stripe_link && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-4">
                    <h4 className="font-bold text-amber-900 mb-1">🚀 Recomendación</h4>
                    <p className="text-amber-800 mb-3 text-sm">
                      Producto: <strong>{res.producto_nombre}</strong>
                    </p>
                    <a href={res.stripe_link} target="_blank" rel="noopener noreferrer">
                      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                        Ver Solución Premium
                      </button>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN MAPA */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">📍 Ayuda Profesional Cerca de Ti</h2>
          <button onClick={() => setVerMapa(!verMapa)} className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg border">
            {verMapa ? 'Ocultar Mapa' : 'Ver Mapa'}
          </button>
          {verMapa && <div className="shadow-xl rounded-xl overflow-hidden border"><Mapa recursos={recursos} /></div>}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-8 text-center text-gray-500 text-sm bg-blue-50">
        <p>Hecho con ❤️ para las familias.</p>
      </footer>

      {/* CHAT BUBBLE (BOTÓN FLOTANTE) */}
      <ChatBubble />

    </main>
  );
}
