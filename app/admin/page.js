'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const FOTOS_DISPONIBLES = [
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
  'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800',
  'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800',
  'https://images.unsplash.com/photo-1581952976147-5a2d15560349?w=800'
];

const TEMAS_PREDEFINIDOS = [
  'Vuelta al cole',
  'Rutinas de sueño',
  'Comedores selectivos',
  'Juegos en familia',
  'Límites y normas',
  'Uso de pantallas',
  'Celos entre hermanos',
  'Autonomía infantil'
];

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [acceso, setAcceso] = useState(false);
  const [estado, setEstado] = useState('');
  const [articulos, setArticulos] = useState([]);
  
  // Estados para generación
  const [temaSelect, setTemaSelect] = useState('');
  const [promptCustom, setPromptCustom] = useState('');

  // Estados para edición
  const [editandoId, setEditandoId] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState({ titulo: '', contenido: '', imagen_url: '' });

  useEffect(() => { if (acceso) cargarArticulos(); }, [acceso]);

  const cargarArticulos = async () => {
    const { data } = await supabase.from('articulos').select('*').order('created_at', { ascending: false });
    if (data) setArticulos(data);
  };

  const generarArticulo = async () => {
    setEstado('⏳ Generando artículo...');
    try {
      // Enviamos tema o prompt al backend
      const res = await fetch('/api/generar-articulo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tema: temaSelect, 
          prompt: promptCustom 
        })
      });
      
      if (res.ok) {
        setEstado('✅ ¡Artículo creado!');
        setTemaSelect(''); // Limpiamos selects
        setPromptCustom('');
        cargarArticulos();
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
      const res = await fetch('/api/borrar-articulo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (res.ok) cargarArticulos();
    } catch (e) { alert("Error"); }
  };

  const iniciarEdicion = (articulo) => {
    setEditandoId(articulo.id);
    setDatosEdicion({ titulo: articulo.titulo, contenido: articulo.contenido, imagen_url: articulo.imagen_url });
  };

  const cancelarEdicion = () => { setEditandoId(null); setDatosEdicion({ titulo: '', contenido: '', imagen_url: '' }); };

  const guardarCambios = async () => {
    try {
      const res = await fetch('/api/editar-articulo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editandoId, ...datosEdicion }) });
      if (res.ok) { alert("✅ Actualizado"); cancelarEdicion(); cargarArticulos(); } else { alert("Error"); }
    } catch (e) { alert("Error"); }
  };

  if (!acceso) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4">🔒 Zona Admin</h1>
          <input type="password" placeholder="Clave" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded w-full mb-4 text-center text-black" />
          <button onClick={() => password === '1234' ? setAcceso(true) : alert('Clave incorrecta')} className="bg-blue-600 text-white px-6 py-2 rounded w-full hover:bg-blue-700">Entrar</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* GENERADOR */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Generador de Artículos IA</h1>
            <button onClick={() => setAcceso(false)} className="text-sm text-red-500 hover:underline">Cerrar Sesión</button>
          </div>

          <div className="space-y-4 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600 font-semibold">Opcional: Elige tema o escribe instrucciones</p>
            
            {/* SELECTOR DE TEMA */}
            <select 
              value={temaSelect} 
              onChange={(e) => { setTemaSelect(e.target.value); setPromptCustom(''); }} 
              className="w-full border p-2 rounded"
            >
              <option value="">-- Tema Aleatorio (Sin especificar) --</option>
              {TEMAS_PREDEFINIDOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <p className="text-center text-xs text-gray-400">O BIEN</p>

            {/* PROMPT PERSONALIZADO */}
            <textarea 
              value={promptCustom}
              onChange={(e) => { setPromptCustom(e.target.value); setTemaSelect(''); }}
              placeholder="Escribe tu propia idea: ej. 'Consejos para viajar en coche con niños pequeños sin que se mareen'"
              className="w-full border p-2 rounded text-sm h-20"
            />
          </div>

          <button onClick={generarArticulo} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition w-full shadow">
            ✨ Generar Artículo
          </button>
          <div className="text-center mt-2 text-sm text-gray-500">{estado}</div>
        </div>

        {/* LISTA DE ARTÍCULOS */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Artículos Publicados</h2>
          {articulos.length === 0 && <p className="text-gray-400 py-4">No hay artículos.</p>}
          
          <div className="space-y-6">
            {articulos.map((art) => (
              <div key={art.id} className="border rounded-lg p-4 bg-gray-50">
                {editandoId === art.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Título</label>
                      <input type="text" value={datosEdicion.titulo} onChange={(e) => setDatosEdicion({...datosEdicion, titulo: e.target.value})} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Contenido</label>
                      <textarea rows="4" value={datosEdicion.contenido} onChange={(e) => setDatosEdicion({...datosEdicion, contenido: e.target.value})} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Seleccionar Foto</label>
                      <div className="grid grid-cols-3 gap-2">
                        {FOTOS_DISPONIBLES.map((url, idx) => (
                          <div key={idx} onClick={() => setDatosEdicion({...datosEdicion, imagen_url: url})} className={`cursor-pointer border-2 rounded overflow-hidden h-20 ${datosEdicion.imagen_url === url ? 'border-blue-600 ring-2 ring-blue-300' : 'border-transparent'}`}>
                            <img src={url} alt="Opción" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={guardarCambios} className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Guardar</button>
                      <button onClick={cancelarEdicion} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {art.imagen_url && <img src={art.imagen_url} alt="" className="w-20 h-20 object-cover rounded" />}
                      <div>
                        <h3 className="font-semibold text-gray-800">{art.titulo}</h3>
                        <p className="text-xs text-gray-400">{new Date(art.created_at).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => iniciarEdicion(art)} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1 px-3 rounded">Editar</button>
                      <button onClick={() => borrarArticulo(art.id)} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded">X</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
