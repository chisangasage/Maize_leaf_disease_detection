import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, useMap, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import { Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Fix for default marker icons in Leaflet
const fixDefaultIcon = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
};

function MapView({ center, zoom, scans, farms, onDrawCreated }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);

    const getDiseaseIcon = (prediction) => {
        const isHealthy = prediction?.toLowerCase().includes("healthy");
        return L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: ${isHealthy ? '#10b981' : '#f97316'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
        });
    };

    return (
        <>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="NASA | ESRI World Imagery"
            />

            {/* Persistent Farm Boundaries */}
            {farms.map((farm) => (
                <GeoJSON
                    key={farm.id || JSON.stringify(farm.boundary_geojson)}
                    data={farm.boundary_geojson}
                    style={{ color: "#10b981", weight: 2, fillOpacity: 0.2 }}
                />
            ))}

            <FeatureGroup>
                <EditControl
                    position="topright"
                    onCreated={onDrawCreated}
                    draw={{
                        rectangle: true,
                        circle: false,
                        circlemarker: false,
                        marker: false,
                        polyline: false,
                        polygon: {
                            allowIntersection: false,
                            shapeOptions: { color: "#10b981" },
                        },
                    }}
                />
            </FeatureGroup>

            {scans.map((scan) => (
                <Marker
                    key={scan.id}
                    position={[scan.latitude, scan.longitude]}
                    icon={getDiseaseIcon(scan.prediction)}
                >
                    <Popup>
                        <div className="p-1">
                            <p className="font-bold text-sm mb-1">{scan.prediction}</p>
                            <p className="text-xs text-gray-500 mb-1">Confidence: {Math.round(scan.confidence * 100)}%</p>
                            <p className="text-xs text-gray-400 italic">{new Date(scan.timestamp).toLocaleDateString()}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}

export default function MapComponent({ scans, farmerId }) {
    const [center, setCenter] = useState([-1.2921, 36.8219]); // Default Nairobi
    const [zoom, setZoom] = useState(13);
    const [farms, setFarms] = useState([]);
    const [isLocating, setIsLocating] = useState(false);

    const fetchFarms = useCallback(async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
            const response = await fetch(`${apiBaseUrl}/api/history/farms/${farmerId || "demo_farmer"}`);
            if (response.ok) {
                const resData = await response.json();
                setFarms(resData.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch farms:", err);
        }
    }, [farmerId]);

    useEffect(() => {
        fixDefaultIcon();
        fetchFarms();

        if (scans && scans.length > 0) {
            setCenter([scans[0].latitude, scans[0].longitude]);
            setZoom(16);
        } else {
            handleLocate();
        }
    }, [scans, fetchFarms]);

    const handleLocate = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCenter([pos.coords.latitude, pos.coords.longitude]);
                setZoom(16);
                setIsLocating(false);
            },
            (err) => {
                console.error("Geolocation error:", err);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleDrawCreated = async (e) => {
        const { layerType, layer } = e;
        if (layerType === "polygon" || layerType === "rectangle") {
            const geojson = layer.toGeoJSON();

            // Optimistic UI: Add to local state immediately
            const newFarm = {
                id: Date.now(),
                boundary_geojson: geojson
            };
            setFarms(prev => [...prev, newFarm]);

            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
                const response = await fetch(`${apiBaseUrl}/api/history/farms`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        farmer_id: farmerId || "demo_farmer",
                        farm_name: `Farm Plot ${new Date().toLocaleTimeString()}`,
                        boundary: geojson
                    })
                });
                if (!response.ok) throw new Error("Save failed");
                console.log("Farm boundary saved");
            } catch (err) {
                console.error("Failed to save farm boundary:", err);
                // Rollback optimistic update on error
                setFarms(prev => prev.filter(f => f.id !== newFarm.id));
                alert("Failed to save farm boundary. Please try again.");
            }
        }
    };

    return (
        <div className="relative h-[600px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
            <button
                onClick={handleLocate}
                className={`absolute top-20 left-3 z-[1000] p-2 bg-white rounded-md shadow-md hover:bg-gray-50 text-gray-700 transition-colors ${isLocating ? 'animate-pulse text-green-600' : ''}`}
                title="Recenter on my location"
            >
                <Crosshair size={20} />
            </button>

            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
            >
                <MapView
                    center={center}
                    zoom={zoom}
                    scans={scans}
                    farms={farms}
                    onDrawCreated={handleDrawCreated}
                />
            </MapContainer>
        </div>
    );
}
