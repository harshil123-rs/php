
"use client";

import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useProgress } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Search, User, AlertCircle } from "lucide-react";
import PatientAnalytics from "@/components/dashboard/patient-analytics";

// --- 3D Components ---

function BodyPart({ position, args, color, name, highlighted, opacity = 1 }: any) {
    const mesh = useRef<any>(null);

    useFrame((state) => {
        if (highlighted && mesh.current) {
            mesh.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
            mesh.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
            mesh.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
        }
    });

    return (
        <mesh position={position} ref={mesh}>
            {args.type === 'box' && <boxGeometry args={args.size} />}
            {args.type === 'sphere' && <sphereGeometry args={args.size} />}
            {args.type === 'cylinder' && <cylinderGeometry args={args.size} />}
            <meshStandardMaterial
                color={highlighted ? "#ef4444" : color}
                transparent
                opacity={highlighted ? 0.9 : opacity}
                emissive={highlighted ? "#ef4444" : "#000000"}
                emissiveIntensity={highlighted ? 0.5 : 0}
            />
            {highlighted && (
                <Html distanceFactor={10}>
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded border border-red-500 whitespace-nowrap">
                        {name}
                    </div>
                </Html>
            )}
        </mesh>
    );
}

function HumanModel({ affectedParts }: { affectedParts: string[] }) {
    const baseColor = "#94a3b8"; // Slate 400

    const isAffected = (part: string) => affectedParts.includes(part);

    return (
        <group position={[0, -1, 0]}>
            {/* Head */}
            <BodyPart
                name="Head"
                position={[0, 2.8, 0]}
                args={{ type: 'sphere', size: [0.4, 32, 32] }}
                color={baseColor}
                highlighted={isAffected('head') || isAffected('brain')}
            />

            {/* Neck */}
            <BodyPart
                name="Neck"
                position={[0, 2.3, 0]}
                args={{ type: 'cylinder', size: [0.15, 0.15, 0.4, 32] }}
                color={baseColor}
                highlighted={isAffected('neck')}
            />

            {/* Torso (Chest) */}
            <BodyPart
                name="Chest"
                position={[0, 1.5, 0]}
                args={{ type: 'box', size: [0.8, 1.2, 0.4] }}
                color={baseColor}
                highlighted={isAffected('chest') || isAffected('lungs') || isAffected('heart')}
            />

            {/* Stomach/Abdomen */}
            <BodyPart
                name="Stomach"
                position={[0, 0.6, 0]}
                args={{ type: 'box', size: [0.7, 0.8, 0.35] }}
                color={baseColor}
                highlighted={isAffected('stomach') || isAffected('liver') || isAffected('kidneys') || isAffected('intestines')}
            />

            {/* Arms */}
            <BodyPart
                name="Left Arm"
                position={[-0.6, 1.5, 0]}
                args={{ type: 'cylinder', size: [0.12, 0.1, 1.4, 32] }}
                color={baseColor}
                highlighted={isAffected('left_arm')}
            />
            <BodyPart
                name="Right Arm"
                position={[0.6, 1.5, 0]}
                args={{ type: 'cylinder', size: [0.12, 0.1, 1.4, 32] }}
                color={baseColor}
                highlighted={isAffected('right_arm')}
            />

            {/* Legs */}
            <BodyPart
                name="Left Leg"
                position={[-0.25, -0.8, 0]}
                args={{ type: 'cylinder', size: [0.15, 0.1, 1.8, 32] }}
                color={baseColor}
                highlighted={isAffected('left_leg')}
            />
            <BodyPart
                name="Right Leg"
                position={[0.25, -0.8, 0]}
                args={{ type: 'cylinder', size: [0.15, 0.1, 1.8, 32] }}
                color={baseColor}
                highlighted={isAffected('right_leg')}
            />

            {/* Internal Organs Visualization (Ghosted inside) */}
            {isAffected('lungs') && (
                <BodyPart name="Lungs" position={[0, 1.6, 0.1]} args={{ type: 'sphere', size: [0.25, 16, 16] }} color="#ef4444" highlighted={true} />
            )}
            {isAffected('heart') && (
                <BodyPart name="Heart" position={[0.1, 1.7, 0.15]} args={{ type: 'sphere', size: [0.15, 16, 16] }} color="#ef4444" highlighted={true} />
            )}
        </group>
    );
}

function Loader() {
    const { progress } = useProgress();
    return <Html center>{progress.toFixed(1)} % loaded</Html>;
}

// --- Main Page Component ---

export default function ThreeDAIPage() {
    const [activeTab, setActiveTab] = useState<"visualizer" | "analysis">("visualizer");
    const [symptoms, setSymptoms] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!symptoms) return;
        setAnalyzing(true);
        try {
            const res = await fetch("/api/ai/symptom-map", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symptoms }),
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">3D AI Health</h1>
                    <p className="text-slate-400">Advanced symptom visualization and health analytics.</p>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("visualizer")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "visualizer" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            }`}
                    >
                        3D Symptom Visualizer
                    </button>
                    <button
                        onClick={() => setActiveTab("analysis")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "analysis" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            }`}
                    >
                        My Health Analysis
                    </button>
                </div>
            </div>

            {activeTab === "visualizer" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    {/* Controls */}
                    <div className="glass-card p-6 space-y-6 h-fit">
                        <div>
                            <label className="text-sm text-slate-400 mb-2 block">Describe your symptoms</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g., chest pain and cough..."
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    className="bg-slate-900/50"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                />
                                <Button onClick={handleAnalyze} disabled={analyzing} className="bg-blue-600 hover:bg-blue-700">
                                    {analyzing ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        {result && !result.error && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">


                                <div>
                                    <h4 className="text-sm font-medium text-slate-300 mb-2">Affected Areas</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(result.affected_parts) && result.affected_parts.map((part: string) => (
                                            <span key={part} className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 capitalize border border-slate-700">
                                                {part.replace('_', ' ')}
                                            </span>
                                        ))}
                                        {(!result.affected_parts || result.affected_parts.length === 0) && (
                                            <span className="text-xs text-slate-500">No specific areas identified.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {result && result.error && (
                            <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400 text-sm">
                                <p className="font-bold mb-1">Analysis Failed</p>
                                <p>{result.error}</p>
                            </div>
                        )}

                        <div className="p-4 bg-slate-900/50 rounded-lg text-xs text-slate-500">
                            <p className="font-semibold mb-1">How it works:</p>
                            <p>AI analyzes your symptoms and highlights the likely affected organs on the 3D model. Use mouse to rotate and zoom.</p>
                        </div>
                    </div>

                    {/* 3D Canvas */}
                    <div className="lg:col-span-2 glass-card relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-black">
                        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} intensity={1} />
                            <pointLight position={[-10, -10, -10]} intensity={0.5} />
                            <Suspense fallback={<Loader />}>
                                <HumanModel affectedParts={result?.affected_parts || []} />
                                <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
                            </Suspense>
                        </Canvas>

                        <div className="absolute bottom-4 right-4 text-xs text-slate-600 pointer-events-none">
                            Powered by Three.js & Gemini AI
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <PatientAnalytics />
                </div>
            )}
        </div>
    );
}
