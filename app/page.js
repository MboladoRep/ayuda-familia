'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import dynamic from 'next/dynamic';

// Cargamos el mapa solo en el cliente
const Mapa = dynamic(() => import('./components/Mapa'), { ssr: false });

export default function Home() {
  // --- ESTADOS ---
  const [hijos, setHijos] = useState([{ id: Date.now(), edad: '', problema: '' }]); // Array de hijos
  const [resultados, setResultados] = useState([]); // Array de resultados
  const [cargando, setCargando] = useState(false);
  
  const [recursos, setRecursos] = useState([]);
  const [verMapa, setVerMapa] = useState(false);

  // Cargar recursos del mapa
  useEffect(() => {
    async function cargarRecursos() {
      const { data } = await supabase.from('recursos_mapa').select('*');
      if (data) setRecursos(data);
    }
    cargarRecursos();
  }, []);

  // --- FUNCIONES PARA GESTIONAR HIJOS ---
  const agregarHijo = () => {
    setHijos([...hijos, { id: Date.now(), edad: '', problema: '' }]);
  };

  const quitarHijo = (id) => {
    setHijos(hijos.filter(h => h.id !== id));
  };

  const actualizarHijo = (id, campo, valor) => {
    setHijos(hijos.map(h => h.id === id ? { ...h, [campo]: valor } : h));
  };

  // --- BUSCADOR MÚLTIPLE ---
  const buscarAyuda = async () => {
    // Validar que haya al menos un hijo con datos
    const hijosValidos = hijos.filter(h => h.edad && h.problema);
    if (hijosValidos.length === 0) {
      alert('Por favor, indica la edad y problema de al menos un hijo');
      return;
    }

    setCargando(true);
    setResultados([]);

    // Hacemos una búsqueda para cada hijo simultáneamente
    const promesasBusqueda = hijosValidos.map(async (hijo) => {
      const { data, error } = await supabase
        .from('guias')
        .select('*')
        .eq('edad', hijo.edad)
        .eq('problema', hijo.problema)
        .single();

      // Devolvemos un objeto con el resultado y los datos del hijo para identificarlo
      if (error) {
        return { 
          status: 'no_encontrado', 
          edad: hijo.edad, 
          problema: hijo.problema, 
          consejo: 'Aún no tenemos guía específica para esto.' 
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
      
      {/* --- SECCIÓN PRINCIPAL --- */}
      <div className="flex flex-col items-center justify-center p-8 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Familia Ayuda</h1>
          <p className="text-gray-600">Tu red de apoyo para la crianza</p>
        </div>

        {/* FORMULARIO DINÁMICO */}
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">¿Qué pasa en casa?</h2>
          
          {hijos.map((hijo, index) => (
            <div key={hijo.id} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
              {/* Botón Quitar (solo si hay más de 1) */}
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={hijo.edad}
                  onChange={(e) => actualizarHijo(hijo.id, 'edad', e.target.value)}
                >
                  <option value="">Edad</option>
                  <option value="0-3 años">0 - 3 años</option>
                  <option value="3-6 años">3 - 6 años</option>
                  <option value="6-12 años">6 - 12 años</option>
                </select>

                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Botón Añadir */}
          <button 
            onClick={agregarHijo} 
            className="w-full mb-6 text-blue-600 font-semibold py-2 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition"
          >
            + Añadir otro hijo/a
          </button>

          <button 
            onClick={buscarAyuda} 
            disabled={cargando} 
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
          >
            {cargando ? 'Buscando soluciones...' : 'Buscar Ayuda'}
          </button>
        </div>

        {/* RESULTADOS MÚLTIPLES */}
        {resultados.length > 0 && (
          <div className="w-full max-w-lg space-y-6 mb-8">
            {resultados.map((res, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800">Edad: {res.edadInput || res.edad}</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Ayuda encontrada</span>
                </div>
                
                <p className="text-gray-700 mb-4 text-lg">{res.consejo_gratis || res.consejo}</p>

                {/* Producto Premium si existe */}
                {res.stripe_link && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-4">
                    <h4 className="font-bold text-amber-900 mb-1">🚀 Recomendación Específica</h4>
                    <p className="text-amber-800 mb-3 text-sm">
                      Para este caso: <strong>{res.producto_nombre}</strong>
                    </p>
                    <a href={res.stripe_link} target="_blank" rel="noopener noreferrer">
                      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm">
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

      {/* --- SECCIÓN MAPA --- */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">📍 Ayuda Profesional Cerca de Ti</h2>
          <p className="text-gray-600 mb-6">Consulta nuestro mapa de centros y especialistas.</p>
          
          <button onClick={() => setVerMapa(!verMapa)} className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg border">
            {verMapa ? 'Ocultar Mapa' : 'Ver Mapa de Recursos'}
          </button>

          {verMapa && (
            <div className="shadow-xl rounded-xl overflow-hidden border">
              <Mapa recursos={recursos} />
            </div>
          )}
        </div>
      </div>

      {/* --- SECCIÓN COMUNIDAD --- */}
      <div className="bg-blue-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">💬 Comunidad de Padres</h2>
          <p className="text-blue-100 mb-8 text-lg">
            ¿Tienes dudas con varios hijos? Pregunta a otros padres que entienden tu situación.
          </p>
          <a href="https://t.me/tu_grupo_telegram" target="_blank" rel="noopener noreferrer">
            <button className="bg-white text-blue-900 font-bold py-4 px-8 rounded-full hover:bg-blue-100 transition text-lg shadow-lg">
              Unirse al Grupo
            </button>
          </a>
        </div>
      </div>

      <footer className="py-8 text-center text-gray-500 text-sm bg-blue-50">
        <p>Hecho con ❤️ para las familias.</p>
      </footer>

    </main>
  );
}
