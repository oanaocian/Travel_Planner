import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

//Fix default marker icons not showing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = ({ locations, center, zoom = 5 }) => {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '500px', width: '100%', borderRadius: '12px' }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {locations.map((location, index) => (
                location.latitude && location.longitude && (
                    <Marker
                        key={index}
                        position={[parseFloat(location.latitude), parseFloat(location.longitude)]}>
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold text-gray-800">{location.name}</p>
                                <p className="text-green-700 text-sm">{location.country}</p>
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
}

export default Map;