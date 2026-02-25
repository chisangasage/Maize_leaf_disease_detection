import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
    Calendar,
    MapPin,
    ChevronRight,
    Search,
    Download,
    AlertTriangle,
    CheckCircle,
    Clock
} from "lucide-react";

export default function HistoryPage() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
            // Using 'demo_farmer' for dissertation walkthrough; can be made dynamic later
            const response = await fetch(`${apiBaseUrl}/api/history/scans?farmer_id=demo_farmer&limit=100`);

            if (!response.ok) throw new Error("Failed to fetch history");

            const resData = await response.json();
            setScans(resData.data || []);
        } catch (err) {
            console.error("History fetch error:", err);
            setError("Unable to load history. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const filteredScans = scans.filter(scan => {
        const matchesSearch = scan.prediction.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" ||
            (filter === "diseased" && !scan.prediction.toLowerCase().includes("healthy")) ||
            (filter === "healthy" && scan.prediction.toLowerCase().includes("healthy"));
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Scan History</h1>
                        <p className="text-gray-600">Track and monitor maize health trends across your farm</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchHistory}
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                            title="Refresh"
                        >
                            <Clock size={20} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                            <Download size={18} />
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 flex flex-col sm:row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by disease name..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-4 py-2 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Scans</option>
                            <option value="diseased">Diseased Only</option>
                            <option value="healthy">Healthy Only</option>
                        </select>
                    </div>
                </div>

                {/* Desktop List View */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            Loading scan history...
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">
                            <AlertTriangle className="mx-auto mb-2" size={32} />
                            {error}
                        </div>
                    ) : filteredScans.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-400" size={32} />
                            </div>
                            <p className="text-lg font-medium">No results found</p>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Weather</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredScans.map((scan) => {
                                        const isHealthy = scan.prediction.toLowerCase().includes("healthy");
                                        return (
                                            <tr key={scan.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                                            <Calendar size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{formatDate(scan.timestamp)}</p>
                                                            <p className="text-xs text-gray-500">{formatTime(scan.timestamp)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {isHealthy ? (
                                                            <CheckCircle className="text-green-500" size={18} />
                                                        ) : (
                                                            <AlertTriangle className="text-orange-500" size={18} />
                                                        )}
                                                        <span className={`font-bold ${isHealthy ? 'text-green-700' : 'text-gray-900'}`}>
                                                            {scan.prediction}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-1.5 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-orange-500'}`}
                                                                style={{ width: `${scan.confidence * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {Math.round(scan.confidence * 100)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <MapPin size={14} className="text-gray-400" />
                                                        <span>{scan.latitude.toFixed(4)}, {scan.longitude.toFixed(4)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {scan.weather_data?.data?.temperature !== undefined ? (
                                                        <div className="text-xs text-gray-600">
                                                            <p className="font-medium text-gray-800">{scan.weather_data.data.temperature}°C</p>
                                                            <p>{scan.weather_data.data.description || scan.weather_data.data.condition}</p>
                                                        </div>
                                                    ) : scan.weather_data?.temperature !== undefined ? (
                                                        <div className="text-xs text-gray-600">
                                                            <p className="font-medium text-gray-800">{scan.weather_data.temperature}°C</p>
                                                            <p>{scan.weather_data.description || scan.weather_data.condition}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No data</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-gray-400 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-all">
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Dashboard Insight Section (Dissertation value-add) */}
                {!loading && scans.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Health Trend</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">
                                    {Math.round((scans.filter(s => s.prediction.toLowerCase().includes("healthy")).length / scans.length) * 100)}%
                                </span>
                                <span className="text-sm text-green-600 font-medium mb-1">Overall Healthy</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Based on the last {scans.length} scans</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Most Common Risk</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-orange-600">
                                    {(() => {
                                        const counts = {};
                                        scans.forEach(s => {
                                            if (!s.prediction.toLowerCase().includes("healthy")) {
                                                counts[s.prediction] = (counts[s.prediction] || 0) + 1;
                                            }
                                        });
                                        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                                        return sorted[0]?.[0] || "None";
                                    })()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Frequency analysis of detected pathogens</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Monitoring Intensity</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-blue-600">{scans.length}</span>
                                <span className="text-sm text-blue-600 font-medium mb-1">Active Points</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Your surveillance data points</p>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
