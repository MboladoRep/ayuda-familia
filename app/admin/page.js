'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [acceso, setAcceso] = useState(false);
  const [estado, setEstado] = useState('');
  const [articulos, setArticulos] = useState([]);

  // Cargar artículos al entrar
  useEffect(() => {
    if (acceso) cargarArticulos();
  }, [acceso]);

  const cargarArticulos = async () => {
    const { data } = await supabase.from('articulos').select('*').order('created_at', { ascending: false });
    if (data) setArticulos(data);
  };

  const generarArticulo = async () => {
    setEstado('⏳ Generando...');
    try {
      const res = await fetch('/api/generar-articulo', { method: 'POST' });
      if (res.ok) {
        setEstado('✅ ¡Artículo creado!');
        cargarArticulos(); // Recargar lista
      } else {
        setEstado('❌ Error al generar');
      }
    } catch (e) {
      setEstado('❌ Error de conexión');
    }
  };

  const borrarArticulo = async (id) => {
    if (!confirm("¿Seguro que quieres borrar este artículo?")) return;
    
    try {
      const res = await fetch('/api/borrar-articulo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        cargarArticulos(); // Recargar lista
      }
    } catch (e) {
      alert("Error al borrar");
    }
  };

  // Pantalla de Login
  if (!acceso) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <h1 className="text-xl font-bold mb-4">🔒 Zona Admin</h1>
          <input 
            type="password" 
            placeholder="Clave" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-4 text-black"
          />
          <button 
            onClick={() => password === '1234' ? setAcceso(true) : alert('Clave incorrecta')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Entrar
          </button>
        </div>
      </main>
    );
  }

  // Panel de Control
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Panel de Administrador</h1>
          
          <button 
            onClick={generarArticulo}
            className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition mr-4"
          >
            ✨ Crear Nuevo Artículo
          </button>
          <span className="text-sm text-gray-500">{estado}</span>
        </div>

        {/* LISTA DE ARTÍCULOS */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Artículos Actuales</h2>
          
          {articulos.length === 0 && <p className="text-gray-400">No hay artículos.</p>}
          
          <div className="space-y-4">
            {articulos.map((art) => (
              <div key={art.id} className="flex justify-between items-center border p-4 rounded-lg hover:bg-gray-50">
                <div>
                  <h3 className="font-semibold text-gray-800">{art.titulo}</h3>
                  <p className="text-xs text-gray-400">{new Date(art.created_at).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => borrarArticulo(art.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-3 rounded"
                >
                  Borrar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
