'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Arreglar icono por defecto de Leaflet en Next.js
const icon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Mapa({ recursos }) {
  // Centro de España por defecto
  const posicionInicial = [40.4168, -3.7038];

  return (
    <MapContainer center={posicionInicial} zoom={5} style={{ height: "400px", width: "100%", borderRadius: "15px" }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {recursos && recursos.map((recurso) => (
        recurso.lat && recurso.lng && (
          <Marker key={recurso.id} position={[recurso.lat, recurso.lng]} icon={icon}>
            <Popup>
              <div className="text-black">
                <b>{recurso.nombre}</b><br />
                <span className="text-gray-600">{recurso.tipo}</span><br />
                <span>{recurso.direccion}</span>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}
