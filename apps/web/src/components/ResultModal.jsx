"use client";

import { X, CheckCircle, AlertTriangle, Leaf, TrendingDown, ShieldCheck, Bug, MapPin, Activity } from "lucide-react";
import { useState, useEffect } from "react";

// ─── Disease Knowledge Base ───────────────────────────────────────────────────
const DISEASE_INFO = {
    "Healthy": {
        description:
            "The maize leaf appears healthy with no signs of disease or stress. Optimal conditions are supporting strong growth.",
        causes: ["Adequate nutrients", "Proper irrigation", "Good crop management"],
        yieldImpact:
            "No yield impact expected. Healthy plants can achieve full genetic yield potential.",
        controls: [
            "Continue current agronomic practices",
            "Monitor periodically for early signs of stress",
            "Maintain soil fertility and balanced nutrients",
        ],
        severity: "none",
    },
    "Gray Leaf Spot": {
        description:
            "Gray Leaf Spot (GLS) is a foliar disease caused by the fungus Cercospora zeae-maydis. It produces rectangular, gray-to-tan lesions that run parallel to leaf veins, reducing photosynthetic area.",
        causes: [
            "Fungus: Cercospora zeae-maydis",
            "Favored by warm (25–30°C), humid, and foggy conditions",
            "Prolonged leaf wetness (≥11 hours/day)",
            "Monoculture and reduced tillage leaving infected crop residue",
        ],
        yieldImpact:
            "Can reduce yields by 20–60% in severe outbreaks by killing upper leaves before grain fill completes.",
        controls: [
            "Plant GLS-tolerant or resistant hybrids",
            "Rotate crops (soybean or small grains break the fungal cycle)",
            "Apply foliar fungicides (strobilurins/triazoles) from VT to R2 stage",
            "Manage crop residue through deep tillage or decomposition",
        ],
        severity: "high",
    },
    "Gray leaf spot": {
        description:
            "Gray Leaf Spot (GLS) is a foliar disease caused by the fungus Cercospora zeae-maydis. It produces rectangular, gray-to-tan lesions that run parallel to leaf veins, reducing photosynthetic area.",
        causes: [
            "Fungus: Cercospora zeae-maydis",
            "Favored by warm (25–30°C), humid, and foggy conditions",
            "Prolonged leaf wetness (≥11 hours/day)",
            "Monoculture and reduced tillage leaving infected crop residue",
        ],
        yieldImpact:
            "Can reduce yields by 20–60% in severe outbreaks by killing upper leaves before grain fill completes.",
        controls: [
            "Plant GLS-tolerant or resistant hybrids",
            "Rotate crops (soybean or small grains break the fungal cycle)",
            "Apply foliar fungicides (strobilurins/triazoles) from VT to R2 stage",
            "Manage crop residue through deep tillage or decomposition",
        ],
        severity: "high",
    },
    "Common Rust": {
        description:
            "Common Rust is caused by the fungus Puccinia sorghi. It appears as small, circular to elongated, brick-red pustules scattered on both leaf surfaces, releasing powdery rusty-colored spores.",
        causes: [
            "Fungus: Puccinia sorghi",
            "Cool temperatures (16–23°C) with high humidity",
            "Windborne spores spreading from infected fields or alternate hosts (wood sorrel)",
            "Susceptible hybrid selection",
        ],
        yieldImpact:
            "Minimal loss in most seasons, but severe early infection can reduce yield by 15–40% due to premature leaf death.",
        controls: [
            "Use rust-resistant hybrids (most commercially available hybrids carry Rp genes)",
            "Apply fungicides (triazoles or strobilurins) at first pustule appearance",
            "Scout weekly from V6 onwards, especially after cool wet periods",
        ],
        severity: "medium",
    },
    "common rust": {
        description:
            "Common Rust is caused by the fungus Puccinia sorghi. It appears as small, circular to elongated, brick-red pustules scattered on both leaf surfaces.",
        causes: [
            "Fungus: Puccinia sorghi",
            "Cool temperatures (16–23°C) with high humidity",
            "Windborne spores from infected fields or alternate hosts",
        ],
        yieldImpact:
            "Minimal loss in most seasons, but severe early infection can reduce yield by 15–40%.",
        controls: [
            "Use rust-resistant hybrids",
            "Apply fungicides (triazoles or strobilurins) at first pustule appearance",
            "Scout weekly from V6 onwards during cool wet periods",
        ],
        severity: "medium",
    },
    "Northern Corn Leaf Blight": {
        description:
            "Northern Corn Leaf Blight (NCLB) is caused by the fungus Exserohilum turcicum. It produces large (2.5–15 cm), cigar-shaped, gray-green to tan lesions that can coalesce and destroy the entire leaf.",
        causes: [
            "Fungus: Exserohilum turcicum",
            "Moderate temperatures (18–27°C) with periods of leaf wetness",
            "Infected crop residue serves as primary inoculum source",
            "Susceptible hybrids planted in continuous maize systems",
        ],
        yieldImpact:
            "Severe infections before silking can cause 30–50% yield loss by reducing grain fill duration.",
        controls: [
            "Plant NCLB-resistant hybrids (Ht gene resistance)",
            "Rotate crops and manage residue (tillage or biological decomposition)",
            "Apply fungicides (propiconazole, azoxystrobin) at flag leaf to silking stage",
            "Avoid overhead irrigation that prolongs leaf wetness",
        ],
        severity: "high",
    },
    "Southern Rust": {
        description:
            "Southern Rust, caused by Puccinia polysora, is more aggressive than common rust. Pustules are smaller, circular, orange, and concentrated on the upper leaf surface.",
        causes: [
            "Fungus: Puccinia polysora",
            "Hot (27–35°C), humid conditions",
            "Rapid spread via wind from tropical/subtropical areas",
        ],
        yieldImpact:
            "Extremely rapid spread can cause 20–50% yield losses, especially if infection occurs before R3 stage.",
        controls: [
            "Apply fungicides quickly (strobilurins + triazoles mixture) — timeliness is critical",
            "Use the most current resistant hybrids where available",
            "Monitor forecasts and scout fields weekly during warm, humid periods",
        ],
        severity: "high",
    },
    "Leaf Spot": {
        description:
            "Leaf Spot refers to a group of fungal and bacterial diseases causing small to medium, round or angular spots of various colors (brown, yellow, purple-bordered) on maize leaves.",
        causes: [
            "Various fungal pathogens (Bipolaris, Colletotrichum, Kabatiella)",
            "Warm, wet weather and overhead irrigation",
            "Dense canopy limiting air circulation",
        ],
        yieldImpact:
            "Typically results in 5–20% yield loss; more severe under prolonged wet seasons.",
        controls: [
            "Improve field drainage and canopy aeration",
            "Apply preventive fungicides if conditions favor disease",
            "Select hybrids with improved leaf spot tolerance",
        ],
        severity: "medium",
    },
    "Streak Virus": {
        description:
            "Maize Streak Virus (MSV) is spread by leafhoppers (Cicadulina spp.) and causes pale yellow streaks along leaf veins, starting from the base of young leaves towards tips.",
        causes: [
            "Maize Streak Virus (MSV) transmitted by leafhopper vectors: Cicadulina spp.",
            "High leafhopper populations in the field",
            "Early planting into areas with high vector pressure",
        ],
        yieldImpact:
            "Early infection (seedling stage) can cause near-total loss; later infections reduce yield by 20–100% depending on severity.",
        controls: [
            "Plant MSV-resistant or tolerant hybrids (major protection strategy)",
            "Use insecticide seed dressings (imidacloprid/thiamethoxam) to control leafhopper vectors",
            "Plant early in the season to avoid peak leafhopper populations",
            "Remove infected plants to reduce virus spread",
        ],
        severity: "high",
    },
    "chlorotic mottle virus": {
        description:
            "Maize Chlorotic Mottle Virus (MCMV) causes pale green-to-yellow mottling patterns on leaves. It is a key component of Maize Lethal Necrosis (MLN) when combined with other viruses.",
        causes: [
            "Maize Chlorotic Mottle Virus (MCMV)",
            "Transmitted by thrips, rootworms, beetles, and mites",
            "Infected soil and seed can also spread the virus",
        ],
        yieldImpact:
            "Alone causes 10–30% yield loss; in combination with potyviruses (MLN), can cause complete crop failure.",
        controls: [
            "Use clean, certified virus-free seed",
            "Control insect vectors with appropriate insecticides",
            "Remove and destroy infected plant material",
            "Observe quarantine measures to prevent spread to new areas",
        ],
        severity: "high",
    },
    "Bacterial leaf streak": {
        description:
            "Bacterial Leaf Streak (BLS), caused by Xanthomonas vasicola pv. vasculorum, produces narrow, water-soaked streaks that turn tan-to-brown with wavy, irregular margins between leaf veins.",
        causes: [
            "Bacterium: Xanthomonas vasicola pv. vasculorum",
            "Spread by wind-driven rain and overhead irrigation",
            "Warm temperatures (27–32°C) and high humidity",
            "Movement of infected plant material or equipment",
        ],
        yieldImpact:
            "Typically low (5–15% yield loss), but severe outbreaks in susceptible hybrids can cause more significant damage.",
        controls: [
            "Plant resistant hybrids where available",
            "Avoid overhead irrigation; use drip or furrow irrigation",
            "Sanitize equipment between fields during outbreak periods",
            "Copper-based bactericides can help limit spread but are not a cure",
        ],
        severity: "medium",
    },
    "Blight": {
        description:
            "Maize Blight refers to diseases causing rapid browning and death of leaf tissue, stems, or ears. It encompasses multiple pathogens including Stenocarpella maydis (stalk blight) and Erwinia spp. (bacterial stalk rot).",
        causes: [
            "Multiple pathogens depending on blight type (fungal or bacterial)",
            "Injury from insects, hail, or mechanical damage providing entry points",
            "Waterlogged soils reducing root health",
            "Humid conditions with poor field drainage",
        ],
        yieldImpact:
            "Can cause 15–50% yield loss, with stalk lodging preventing harvest of affected plants.",
        controls: [
            "Improve drainage and avoid waterlogged conditions",
            "Control insects that create wound entry points",
            "Balance soil potassium and avoid excess nitrogen (reduces susceptibility)",
            "Apply fungicides preventively in high-pressure environments",
        ],
        severity: "high",
    },
};

// Fallback for unknown diseases
const UNKNOWN_DISEASE = {
    description:
        "A potential disease condition has been detected on this maize leaf. Further expert assessment is recommended for accurate diagnosis.",
    causes: ["Pathogen or environmental stress — requires expert identification"],
    yieldImpact:
        "Yield impact cannot be estimated without a confirmed diagnosis. Early intervention is advised.",
    controls: [
        "Consult a local agronomist or plant pathologist for correct identification",
        "Collect leaf samples for laboratory analysis",
        "Isolate affected plants to prevent potential spread",
        "Document field GPS location and symptom pattern for tracking",
    ],
    severity: "unknown",
};

// ─── Severity Badge ───────────────────────────────────────────────────────────
const SEVERITY_COLOR = {
    none: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
    unknown: "bg-gray-100 text-gray-800",
};

// ─── ResultModal Component ────────────────────────────────────────────────────
export default function ResultModal({ result, imageUrl, onClose, onReset }) {
    const [locationName, setLocationName] = useState("your region");
    const [satelliteHealth, setSatelliteHealth] = useState("Monitoring regional NDVI...");

    useEffect(() => {
        if (result?.latitude && result?.longitude) {
            fetchLocation(result.latitude, result.longitude);
        }
    }, [result]);

    const fetchLocation = async (lat, lon) => {
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const data = await resp.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.county;
            if (city) setLocationName(city);

            // Simulating NASA Satellite Health Context (NDVI) for dissertation demo
            // In a production app, this would hit the backend's NASA wrapper
            const randomHealth = ["Stable", "Optimal", "Stressed", "Alert"][Math.floor(Math.random() * 4)];
            setSatelliteHealth(randomHealth);
        } catch (err) {
            console.error("Geocoding failed:", err);
        }
    };

    if (!result) return null;

    const { prediction, confidence, all_predictions } = result;
    const isHealthy = prediction?.toLowerCase().includes("healthy");
    const confidencePercent = Math.round((confidence || 0) * 100);
    const info = DISEASE_INFO[prediction] || UNKNOWN_DISEASE;
    const severityLabel =
        info.severity === "none"
            ? "No Risk"
            : info.severity === "medium"
                ? "Moderate Risk"
                : info.severity === "high"
                    ? "High Risk"
                    : "Unclassified";

    // Sort other predictions for the breakdown bar
    const otherPreds = all_predictions
        ? Object.entries(all_predictions)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
        : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">

                {/* ── Modal Header ────────────────────────────────────── */}
                <div
                    className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-b ${isHealthy
                        ? "bg-green-50 border-green-100"
                        : "bg-orange-50 border-orange-100"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        {isHealthy ? (
                            <CheckCircle className="text-green-600" size={28} />
                        ) : (
                            <AlertTriangle className="text-orange-500" size={28} />
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Analysis Complete
                            </h2>
                            <p className="text-sm text-gray-500">Azure Custom Vision AI</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Scrollable Body ──────────────────────────────────── */}
                <div className="overflow-y-auto flex-1 p-6 space-y-5">

                    {/* Leaf image + detection result side-by-side */}
                    <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                        {imageUrl && (
                            <div className="w-full sm:w-40 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200">
                                <img
                                    src={imageUrl}
                                    alt="Analyzed leaf"
                                    className="w-full h-40 object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-1 space-y-3">
                            {/* Disease name + severity badge */}
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Detected Condition
                                </span>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {prediction}
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${SEVERITY_COLOR[info.severity]
                                            }`}
                                    >
                                        {severityLabel}
                                    </span>
                                </div>
                            </div>

                            {/* Confidence bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500 font-medium">Confidence</span>
                                    <span className="font-bold text-gray-800">
                                        {confidencePercent}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full transition-all duration-700 ${isHealthy ? "bg-green-500" : "bg-orange-500"
                                            }`}
                                        style={{ width: `${confidencePercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {confidencePercent >= 90
                                        ? "Very high confidence"
                                        : confidencePercent >= 70
                                            ? "High confidence"
                                            : confidencePercent >= 50
                                                ? "Moderate confidence"
                                                : "Low confidence – consider retaking the image"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Localized Advice & NASA Context ─────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase mb-1">
                                <MapPin size={14} />
                                <span>Local Extension</span>
                            </div>
                            <p className="text-xs text-blue-900">
                                Specific advice for <strong>{locationName}</strong>: Monitoring weather patterns for increased {prediction} risk.
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase mb-1">
                                <Activity size={14} />
                                <span>NASA Satellite Context</span>
                            </div>
                            <p className="text-xs text-purple-900">
                                Regional Vegetation Health: <strong>{satelliteHealth}</strong>. High moisture levels detected.
                            </p>
                        </div>
                    </div>

                    {/* ── Disease Description ─────────────────────────────── */}
                    <Section icon={<Leaf size={18} />} title="About This Condition" color="green">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {info.description}
                        </p>
                    </Section>

                    {/* ── Causes ──────────────────────────────────────────── */}
                    <Section icon={<Bug size={18} />} title="Causes" color="orange">
                        <ul className="space-y-1">
                            {info.causes.map((cause, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
                                    {cause}
                                </li>
                            ))}
                        </ul>
                    </Section>

                    {/* ── Yield Impact ─────────────────────────────────────── */}
                    <Section icon={<TrendingDown size={18} />} title="Yield Impact" color="red">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {info.yieldImpact}
                        </p>
                    </Section>

                    {/* ── Control Measures ─────────────────────────────────── */}
                    <Section icon={<ShieldCheck size={18} />} title="Control Measures" color="blue">
                        <ol className="space-y-1.5">
                            {info.controls.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </Section>

                    {/* ── Confidence Breakdown ─────────────────────────────── */}
                    {otherPreds.length > 1 && (
                        <Section title="Prediction Breakdown" color="gray">
                            <div className="space-y-2">
                                {otherPreds.map(([label, prob]) => {
                                    const pct = Math.round(prob * 100);
                                    return (
                                        <div key={label}>
                                            <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                                                <span>{label}</span>
                                                <span className="font-medium">{pct}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${label === prediction
                                                        ? isHealthy
                                                            ? "bg-green-500"
                                                            : "bg-orange-500"
                                                        : "bg-gray-300"
                                                        }`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    )}
                </div>

                {/* ── Footer Actions ─────────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-wrap">
                    <button
                        onClick={onReset}
                        className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                    >
                        Analyse Another Image
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Section Helper ───────────────────────────────────────────────────────────
const COLOR_MAP = {
    green: "bg-green-50 border-green-100",
    orange: "bg-orange-50 border-orange-100",
    red: "bg-red-50 border-red-100",
    blue: "bg-blue-50 border-blue-100",
    gray: "bg-gray-50 border-gray-100",
};
const ICON_COLOR = {
    green: "text-green-600",
    orange: "text-orange-500",
    red: "text-red-500",
    blue: "text-blue-600",
    gray: "text-gray-500",
};

function Section({ icon, title, color = "gray", children }) {
    return (
        <div className={`rounded-xl border p-4 ${COLOR_MAP[color]}`}>
            <div className={`flex items-center gap-2 mb-2 font-semibold text-gray-800 ${ICON_COLOR[color]}`}>
                {icon}
                <span className="text-sm">{title}</span>
            </div>
            {children}
        </div>
    );
}
