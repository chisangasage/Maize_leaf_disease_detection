import { useState, useEffect, lazy, Suspense } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Layers, Map as MapIcon, Database, Info, Layout, Activity } from "lucide-react";

// Dynamically import MapComponent to prevent SSR "window is not defined" errors
const MapComponent = lazy(() => import("@/components/MapComponent"));

const MapLoading = () => (
    <div className="h-[600px] w-full bg-gray-100 rounded-xl flex flex-col items-center justify-center border border-gray-200 animate-pulse">
        <MapIcon className="text-gray-300 mb-2" size={48} />
        <p className="text-gray-500 font-medium">Initialising Satellite Map Engine...</p>
    </div>
);

export default function MapPage() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetchScans();
    }, []);

    const fetchScans = async () => {
        try {
            setLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
            const response = await fetch(`${apiBaseUrl}/api/history/scans?farmer_id=demo_farmer&limit=100`);
            if (!response.ok) throw new Error("Failed to fetch scans");
            const resData = await response.json();
            setScans(resData.data || []);
        } catch (err) {
            console.error("Map scans fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Page Header */}
                <div className="mb-8 overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-green-600 font-bold text-sm uppercase tracking-wider mb-2">
                                <Layers size={16} />
                                <span>Geospatial Intelligence</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Farm Health Plan</h1>
                            <p className="text-gray-600 max-w-2xl">
                                Visualise your farm from space using NASA satellite imagery.
                                Identify "Red Zones" of infection and draw custom farm boundaries for precise monitoring.
                            </p>
                        </div>

                        {/* Quick Stats Banner */}
                        <div className="flex gap-4">
                            <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                                <p className="text-xs text-green-600 font-bold uppercase">Healthy Zones</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {scans.filter(s => s.prediction.toLowerCase().includes("healthy")).length}
                                </p>
                            </div>
                            <div className="bg-orange-50 px-4 py-3 rounded-xl border border-orange-100">
                                <p className="text-xs text-orange-600 font-bold uppercase">Risk Spots</p>
                                <p className="text-2xl font-bold text-orange-700">
                                    {scans.filter(s => !s.prediction.toLowerCase().includes("healthy")).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Map Section */}
                    <div className="p-2 sm:p-4 bg-gray-50 border-t border-gray-100">
                        {isMounted ? (
                            <Suspense fallback={<MapLoading />}>
                                <MapComponent scans={scans} farmerId="demo_farmer" />
                            </Suspense>
                        ) : (
                            <MapLoading />
                        )}
                    </div>

                    {/* Map Controls Guide */}
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-500 border-t border-gray-100">
                        <div className="flex gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 h-fit">
                                <Layout size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 mb-1">Custom Farm Plots</p>
                                <p>Use the polygon tool on the right to draw your farm boundaries on the satellite view.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600 h-fit">
                                <Activity size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 mb-1">Infection Mapping</p>
                                <p>Circular pins mark disease hotspots. Click any pin to see detailed scan results.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600 h-fit">
                                <Database size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 mb-1">NASA Insights</p>
                                <p>Base layer uses high-resolution NASA satellite imagery for vegetation context.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Tips */}
                <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl flex flex-col md:row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex bg-white/20 p-4 rounded-full">
                            <Info size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">How to use this for your dissertation?</h2>
                            <p className="text-blue-100 max-w-xl">
                                The Farm Health Plan proves you can synthesize AI detections with geospatial coordinates.
                                This visualization demonstrates <strong>Temporal Disease Spread Analysis</strong> — a key contribution to modern precision agriculture research.
                            </p>
                        </div>
                    </div>
                    <a
                        href="/detect"
                        className="whitespace-nowrap bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                    >
                        Start New Scan
                    </a>
                </div>
            </main>

            <Footer />
        </div>
    );
}
