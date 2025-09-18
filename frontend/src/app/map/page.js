'use client';
import dynamic from 'next/dynamic';

const Map = dynamic(
    () => import('../../components/Map'), 
    { ssr: false }
);

// --- NEW: A simple legend component ---
const MapLegend = () => (
    <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        zIndex: 1000 // Ensures it's on top of the map
    }}>
        <h4 style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Legend</h4>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <img src="https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" width="12" style={{ marginRight: '5px' }} />
            <span>Potato Early Blight</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <img src="https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png" width="12" style={{ marginRight: '5px' }} />
            <span>Tomato Late Blight</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" width="12" style={{ marginRight: '5px' }} />
            <span>Healthy Tomato</span>
        </div>
    </div>
);


export default function MapPage() {
    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <Map />
            <MapLegend />
        </div>
    );
}