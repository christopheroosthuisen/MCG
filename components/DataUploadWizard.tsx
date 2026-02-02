
import React, { useState } from 'react';
import { Text, Button, Card, Badge } from './UIComponents';
import { ImportSource, StrokesGainedStats, RecommendationEngine, SwingMetrics, SwingAnalysis } from '../types';
import { COLORS, MOCK_COURSES } from '../constants';
import { db } from '../services/dataService';

const Icons = {
    Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    Activity: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
    Scan: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>,
    ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
    Eye: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
    Edit: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
};

// --- GOLF PHYSICS ENGINE ---
class GolfPhysicsEngine {
    data: SwingMetrics;
    hand: 'Right' | 'Left';
    issues: string[] = [];
    praise: string[] = [];

    constructor(data: SwingMetrics, hand: 'Right' | 'Left' = 'Right') {
        this.data = data;
        this.hand = hand;
    }

    analyzeFlightLaws() {
        const path = this.data.path || 0;
        const face = this.data.faceAngle || 0;
        
        // Adjust for Dexterity
        const calcPath = this.hand === 'Right' ? path : -path;
        const calcFace = this.hand === 'Right' ? face : -face;

        // 1. Calculate Face-to-Path (The metric that dictates curve)
        const faceToPath = calcFace - calcPath;
        
        // 2. Determine Start Direction
        let startDir = "Straight";
        if (Math.abs(calcFace) < 1.0) startDir = "Straight";
        else if (calcFace > 0) startDir = "Right";
        else startDir = "Left";

        // 3. Determine Curvature
        let curveType = "Straight";
        if (Math.abs(faceToPath) < 1.5) curveType = "Straight";
        else if (faceToPath > 0) curveType = this.hand === 'Right' ? "Fade/Slice (Curves Right)" : "Fade/Slice (Curves Left)";
        else curveType = this.hand === 'Right' ? "Draw/Hook (Curves Left)" : "Draw/Hook (Curves Right)";

        // 4. Diagnosis
        const diagnosisText = `Ball started ${startDir} and hit a ${curveType}.`;
        
        // SLICE LOGIC
        if (faceToPath > 2.0) {
            if (calcPath < -2.0) { // Out-to-In
                this.issues.push(`Slice Cause (Over-the-Top): You swung ${Math.abs(path)}° ${this.hand === 'Right' ? 'Left' : 'Right'} across the ball with an Open Face.`);
            } else { // Push Slice
                this.issues.push(`Push-Slice Cause: Your path was okay, but your Face was wide open (${face}°). Likely a grip issue or cupped wrist.`);
            }
        }

        // HOOK LOGIC
        if (faceToPath < -2.0) {
            if (calcPath > 2.0) { // In-to-Out
                this.issues.push(`Hook Cause (Stuck): You swung ${Math.abs(path)}° ${this.hand === 'Right' ? 'Right' : 'Left'} (In-to-Out) but flipped your hands, closing the face.`);
            }
        }
        
        return { diagnosisText, faceToPath };
    }

    analyzeEfficiency() {
        let smash = this.data.smashFactor || 0;
        const cs = this.data.clubSpeed || 0;
        const bs = this.data.ballSpeed || 0;
        const spin = this.data.spinRate || 0;
        const aoa = this.data.attackAngle || 0;

        if (smash === 0 && cs > 0) {
            smash = bs / cs;
        }

        // 1. Smash Factor Check
        if (smash >= 1.48) {
            this.praise.push(`Elite Ball Striking: Smash Factor of ${smash.toFixed(2)} means a perfect center strike.`);
        } else if (smash < 1.43 && cs > 90) {
            this.issues.push(`Low Efficiency (${smash.toFixed(2)}): You are losing ball speed. Likely hitting Heel or Toe.`);
        }

        // 2. Spin/Launch Optimization
        if (cs > 85) { // Driver speeds
            if (spin > 3200) {
                let msg = `High Spin (${spin} rpm): This kills distance.`;
                if (aoa < 0) {
                    msg += " Cause: Hitting Down (Negative Attack Angle) on a driver creates excess spin.";
                } else {
                    msg += " Cause: Strike was likely low on the face (Gear Effect).";
                }
                this.issues.push(msg);
            } else if (spin < 1800 && spin > 0) {
                this.issues.push("Low Spin: Careful, the ball might drop out of the sky too fast.");
            }
        }

        return smash;
    }
}

type WizardStep = 'SELECT_SOURCE' | 'INPUT_DATA' | 'PROCESSING' | 'RECOMMENDATION' | 'MANUAL_SCORE';

interface DataUploadWizardProps {
    onClose: () => void;
    onComplete: (stats: any) => void;
}

interface ShotAnalysisResult {
    diagnosis: string;
    ftp: number;
    smash: number;
    issues: string[];
    praise: string[];
}

export const DataUploadWizard: React.FC<DataUploadWizardProps> = ({ onClose, onComplete }) => {
    const [step, setStep] = useState<WizardStep>('SELECT_SOURCE');
    const [source, setSource] = useState<ImportSource | null>(null);
    const [dexterity, setDexterity] = useState<'Right' | 'Left'>('Right');
    
    // Strokes Gained State
    const [sgStats, setSgStats] = useState<StrokesGainedStats>({
        offTee: 0, approach: 0, aroundGreen: 0, putting: 0, total: 0, handicap: 5.4
    });
    
    // Shot Data State
    const [shotMetrics, setShotMetrics] = useState<SwingMetrics>({
        clubSpeed: 105, ballSpeed: 155, path: 0, faceAngle: 0, spinRate: 2500, launchAngle: 12, attackAngle: 0, smashFactor: 1.48
    });

    // Manual Score Share State
    const [manualScore, setManualScore] = useState({ score: 72, course: 'My Home Course' });

    const [recommendation, setRecommendation] = useState<RecommendationEngine | null>(null);
    const [shotAnalysis, setShotAnalysis] = useState<ShotAnalysisResult | null>(null);

    const processData = () => {
        setStep('PROCESSING');
        setTimeout(() => {
            if (source === 'SHOT_DOCTOR') {
                const engine = new GolfPhysicsEngine(shotMetrics, dexterity);
                const { diagnosisText, faceToPath } = engine.analyzeFlightLaws();
                const smash = engine.analyzeEfficiency();
                
                setShotAnalysis({
                    diagnosis: diagnosisText,
                    ftp: faceToPath,
                    smash,
                    issues: engine.issues,
                    praise: engine.praise
                });
            } else if (source === 'MANUAL') {
                // Just log the round, no detailed SG
                // Skip directly to complete for simple manual entry
            } else {
                // Existing SG Logic for App Imports
                const areas = [
                    { id: 'DRIVING', val: sgStats.offTee },
                    { id: 'IRON_PLAY', val: sgStats.approach },
                    { id: 'SHORT_GAME', val: sgStats.aroundGreen },
                    { id: 'PUTTING', val: sgStats.putting }
                ];
                areas.sort((a, b) => a.val - b.val);
                const worstArea = areas[0];

                let rec: RecommendationEngine = {
                    focusArea: worstArea.id as any,
                    recommendedDrills: [],
                    reasoning: ''
                };

                if (worstArea.id === 'PUTTING') {
                    rec.recommendedCourseId = 'c7'; 
                    rec.recommendedDrills = ['3', 'd-putt-2'];
                    rec.reasoning = `Based on imported data, you are losing ${Math.abs(worstArea.val).toFixed(2)} strokes per round on the greens.`;
                } else if (worstArea.id === 'SHORT_GAME') {
                     rec.recommendedCourseId = 'c5'; 
                     rec.recommendedDrills = ['4', 'd-chip-2', 'd-bunker-1'];
                     rec.reasoning = `Your short game data indicates a loss of ${Math.abs(worstArea.val).toFixed(2)} strokes.`;
                } else if (worstArea.id === 'IRON_PLAY') {
                     rec.recommendedCourseId = 'c3';
                     rec.recommendedDrills = ['1'];
                     rec.reasoning = `Approach play is the key separator. Data shows you losing ${Math.abs(worstArea.val).toFixed(2)} strokes here.`;
                } else {
                     rec.recommendedCourseId = 'c1';
                     rec.recommendedDrills = ['1'];
                     rec.reasoning = `Driving stats are setting you back ${Math.abs(worstArea.val).toFixed(2)} strokes.`;
                }
                setRecommendation(rec);
            }
            setStep('RECOMMENDATION');
        }, 1200);
    };

    const handleComplete = () => {
        if (source === 'SHOT_DOCTOR' && shotAnalysis) {
            const newSwing: SwingAnalysis = {
                id: crypto.randomUUID(),
                date: new Date(),
                videoUrl: '', 
                thumbnailUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=400',
                clubUsed: 'DRIVER',
                tags: ['Shot Doctor', 'Manual Entry'],
                metrics: shotMetrics,
                feedback: [
                    ...shotAnalysis.issues.map(i => ({ id: crypto.randomUUID(), timestamp: 0, text: i, severity: 'WARNING' as const, category: 'PLANE' as const })),
                    ...shotAnalysis.praise.map(p => ({ id: crypto.randomUUID(), timestamp: 0, text: p, severity: 'INFO' as const, category: 'PLANE' as const }))
                ],
                keyframes: [],
                score: Math.max(0, 100 - (shotAnalysis.issues.length * 10))
            };
            db.addSwing(newSwing);
        } else if (source === 'MANUAL') {
             db.addRound({
                id: crypto.randomUUID(),
                courseName: manualScore.course,
                date: new Date(),
                score: manualScore.score,
                par: 72,
                holesPlayed: 18,
                fairwaysHit: 0,
                greensInRegulation: 0,
                putts: 0,
                isCompleted: true
            });
        } else {
            onComplete(sgStats);
        }
        onClose();
    };

    const SourceButton: React.FC<{ 
        id: ImportSource, 
        label: string, 
        icon?: React.ReactNode,
        isApp?: boolean,
        description?: string,
        color?: string
    }> = ({ id, label, icon, isApp, description, color }) => (
        <button
            onClick={() => {
                setSource(id);
                if (id === 'MANUAL') {
                    setStep('MANUAL_SCORE');
                } else {
                    setStep('INPUT_DATA');
                }
            }}
            className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all shadow-sm group h-28 w-full relative overflow-hidden"
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 text-xl shadow-sm ${isApp ? 'bg-black text-white' : (id === 'SHOT_DOCTOR' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600')}`} style={color ? { backgroundColor: color, color: 'white' } : {}}>
                {icon || label[0]}
            </div>
            <span className="text-xs font-bold text-gray-700 group-hover:text-orange-700 text-center leading-tight">{label}</span>
            {description && <span className="text-[9px] text-gray-400 mt-1">{description}</span>}
        </button>
    );

    const StatInput: React.FC<{
        label: string;
        value: number;
        onChange: (v: number) => void;
        step?: number;
    }> = ({ label, value, onChange, step = 0.1 }) => (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-700 text-sm truncate pr-2">{label}</span>
            <div className="flex items-center gap-2">
                 <button 
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                    onClick={() => onChange(Number((value - step).toFixed(1)))}
                 >-</button>
                 <input 
                    type="number" 
                    step={step}
                    className="w-16 text-center font-mono font-bold bg-transparent outline-none"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                 />
                 <button 
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                    onClick={() => onChange(Number((value + step).toFixed(1)))}
                 >+</button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white sm:rounded-none animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-gray-900">
                    <Icons.Close />
                </button>
                <div className="text-center">
                    <Text variant="h4" className="text-base font-bold">
                        {step === 'SELECT_SOURCE' ? 'Data Studio' : source === 'SHOT_DOCTOR' ? 'Shot Analysis' : 'Import Stats'}
                    </Text>
                    <div className="flex gap-1 justify-center mt-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 rounded-full w-4 ${
                                (step === 'SELECT_SOURCE' && i === 1) || 
                                ((step === 'INPUT_DATA' || step === 'MANUAL_SCORE') && i === 2) || 
                                ((step === 'PROCESSING' || step === 'RECOMMENDATION') && i === 3)
                                ? 'bg-orange-500' 
                                : 'bg-gray-200'
                            }`} />
                        ))}
                    </div>
                </div>
                <div className="w-8"></div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6">
                
                {/* STEP 1: SELECT SOURCE */}
                {step === 'SELECT_SOURCE' && (
                    <div className="space-y-6 max-w-md mx-auto">
                        <div className="text-center mb-4">
                            <Text variant="h2" className="mb-2">Analysis Source</Text>
                            <Text color="gray">Analyze a single shot or import round data from your favorite app to get AI recommendations.</Text>
                        </div>
                        
                        <Text variant="caption" className="font-bold text-gray-400 uppercase tracking-widest">Tools</Text>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <SourceButton id="SHOT_DOCTOR" label="Shot Doctor" description="Physics Analysis" icon={<Icons.Eye />} />
                            <SourceButton id="MANUAL" label="Score Share" description="Log Score Only" icon={<Icons.Edit />} />
                        </div>

                        <Text variant="caption" className="font-bold text-gray-400 uppercase tracking-widest">Sync App Data (Stats)</Text>
                        <div className="grid grid-cols-3 gap-3">
                            <SourceButton id="18BIRDIES" label="18Birdies" color="#00C853" icon="🐦" />
                            <SourceButton id="ARCCOS" label="Arccos" color="#000000" icon="🅰️" />
                            <SourceButton id="THEGRINT" label="TheGrint" color="#2196F3" icon="👻" />
                            <SourceButton id="GOLFSHOT" label="Golfshot" color="#FF5722" icon="🎯" />
                            <SourceButton id="HOLE19" label="Hole19" color="#2962FF" icon="19" />
                            <SourceButton id="GOLFPAD" label="Golf Pad" color="#4CAF50" icon="📱" />
                            <SourceButton id="SWINGU" label="SwingU" color="#607D8B" icon="U" />
                            <SourceButton id="GOLFLOGIX" label="GolfLogix" color="#8BC34A" icon="🟩" />
                            <SourceButton id="GOLFPLAYED" label="GolfPlayed" color="#FFC107" icon="🌍" />
                            <SourceButton id="SHOTSCOPE" label="Shot Scope" color="#3F51B5" icon="⌚" />
                        </div>
                    </div>
                )}

                {/* STEP 2: MANUAL SCORE */}
                {step === 'MANUAL_SCORE' && (
                    <div className="space-y-6 max-w-md mx-auto">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📝</div>
                            <Text variant="h2">Log Score</Text>
                            <Text color="gray">Quickly save your round to track handicap trends.</Text>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Course Name</label>
                                <input 
                                    type="text" 
                                    className="w-full p-4 rounded-xl border border-gray-300 focus:border-orange-500 outline-none font-bold"
                                    value={manualScore.course}
                                    onChange={(e) => setManualScore({...manualScore, course: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Total Score</label>
                                <input 
                                    type="number" 
                                    className="w-full p-4 rounded-xl border border-gray-300 focus:border-orange-500 outline-none text-4xl font-black text-center"
                                    value={manualScore.score}
                                    onChange={(e) => setManualScore({...manualScore, score: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: INPUT DATA (FOR APPS) */}
                {step === 'INPUT_DATA' && (
                    <div className="space-y-6 max-w-md mx-auto">
                        {/* Source Header */}
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold">
                                    {source && source[0]}
                                </div>
                                <div>
                                    <Text variant="h4" className="text-base">{source === 'SHOT_DOCTOR' ? 'Ball Data' : 'Import SG Data'}</Text>
                                    <Text variant="caption">Enter values from {source}</Text>
                                </div>
                            </div>
                            {source === 'SHOT_DOCTOR' && (
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button 
                                        onClick={() => setDexterity('Right')}
                                        className={`px-3 py-1 text-xs font-bold rounded ${dexterity === 'Right' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                                    >RH</button>
                                    <button 
                                        onClick={() => setDexterity('Left')}
                                        className={`px-3 py-1 text-xs font-bold rounded ${dexterity === 'Left' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                                    >LH</button>
                                </div>
                            )}
                        </div>

                        {source === 'SHOT_DOCTOR' && (
                            <div className="bg-gray-900 text-white rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-colors shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-orange-400">
                                        <Icons.Scan />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Scan Screenshot</div>
                                        <div className="text-xs text-gray-400">Auto-fill from photo</div>
                                    </div>
                                </div>
                                <Badge variant="neutral" className="bg-white/10 text-white border-none">AI</Badge>
                            </div>
                        )}

                        <div className="h-px bg-gray-200 w-full my-2"></div>

                        {/* Inputs */}
                        <div className="space-y-3">
                            {source === 'SHOT_DOCTOR' ? (
                                <>
                                    <StatInput label="Club Speed (mph)" value={shotMetrics.clubSpeed || 0} onChange={(v) => setShotMetrics({...shotMetrics, clubSpeed: v})} step={1} />
                                    <StatInput label="Ball Speed (mph)" value={shotMetrics.ballSpeed || 0} onChange={(v) => setShotMetrics({...shotMetrics, ballSpeed: v})} step={1} />
                                    <StatInput label="Path (+R/-L)" value={shotMetrics.path || 0} onChange={(v) => setShotMetrics({...shotMetrics, path: v})} />
                                    <StatInput label="Face (+R/-L)" value={shotMetrics.faceAngle || 0} onChange={(v) => setShotMetrics({...shotMetrics, faceAngle: v})} />
                                    <StatInput label="Spin (rpm)" value={shotMetrics.spinRate || 0} onChange={(v) => setShotMetrics({...shotMetrics, spinRate: v})} step={100} />
                                    <StatInput label="AoA (+Up/-Dn)" value={shotMetrics.attackAngle || 0} onChange={(v) => setShotMetrics({...shotMetrics, attackAngle: v})} />
                                </>
                            ) : (
                                <>
                                    <Text variant="caption" className="mb-2 text-center text-gray-500">Enter Strokes Gained values from your app summary.</Text>
                                    <StatInput label="SG: Off the Tee" value={sgStats.offTee} onChange={(v) => setSgStats({...sgStats, offTee: v})} />
                                    <StatInput label="SG: Approach" value={sgStats.approach} onChange={(v) => setSgStats({...sgStats, approach: v})} />
                                    <StatInput label="SG: Around Green" value={sgStats.aroundGreen} onChange={(v) => setSgStats({...sgStats, aroundGreen: v})} />
                                    <StatInput label="SG: Putting" value={sgStats.putting} onChange={(v) => setSgStats({...sgStats, putting: v})} />
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: PROCESSING */}
                {step === 'PROCESSING' && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin mb-6"></div>
                        <Text variant="h2" className="mb-2">Crunching Numbers</Text>
                        <Text color="gray">{source === 'SHOT_DOCTOR' ? 'Applying D-Plane Physics...' : 'Generating Training Plan...'}</Text>
                    </div>
                )}

                 {/* STEP 4: RECOMMENDATION / RESULTS */}
                 {step === 'RECOMMENDATION' && (
                    <div className="space-y-6 max-w-md mx-auto pb-20">
                        {/* SHOT DOCTOR RESULTS */}
                        {source === 'SHOT_DOCTOR' && shotAnalysis && (
                            <>
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                    <Text variant="caption" className="font-bold text-gray-400 uppercase tracking-widest mb-3">Analysis Result</Text>
                                    
                                    <div className="flex gap-4 mb-6">
                                        <div className="flex-1 text-center border-r border-gray-100">
                                            <div className="text-3xl font-black text-gray-900">{shotAnalysis.smash.toFixed(2)}</div>
                                            <div className="text-[10px] uppercase font-bold text-gray-400">Smash Factor</div>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <div className="text-3xl font-black text-gray-900">{shotAnalysis.ftp.toFixed(1)}°</div>
                                            <div className="text-[10px] uppercase font-bold text-gray-400">Face to Path</div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-900 text-sm mb-4">
                                        <strong>Diagnosis:</strong> {shotAnalysis.diagnosis}
                                    </div>

                                    <div className="space-y-2">
                                        {shotAnalysis.issues.map((issue, i) => (
                                            <div key={i} className="flex gap-2 items-start text-sm text-red-800 bg-red-50 p-2 rounded-lg">
                                                <span>⚠️</span>
                                                <span>{issue}</span>
                                            </div>
                                        ))}
                                        {shotAnalysis.praise.map((p, i) => (
                                            <div key={i} className="flex gap-2 items-start text-sm text-green-800 bg-green-50 p-2 rounded-lg">
                                                <span>✅</span>
                                                <span>{p}</span>
                                            </div>
                                        ))}
                                        {shotAnalysis.issues.length === 0 && shotAnalysis.praise.length === 0 && (
                                            <div className="text-sm text-gray-500 italic text-center">No major mechanical flaws detected in this shot.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-900 text-white rounded-2xl p-5">
                                    <Text variant="h4" color="white" className="mb-2">The Math (D-Plane)</Text>
                                    <div className="space-y-2 text-sm text-gray-400">
                                        <p><strong>Curvature:</strong> Created by difference between Face ({shotMetrics.faceAngle}°) and Path ({shotMetrics.path}°).</p>
                                        <p><strong>Efficiency:</strong> Ball Speed ({shotMetrics.ballSpeed}) / Club Speed ({shotMetrics.clubSpeed}) = {shotAnalysis.smash.toFixed(2)}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* STROKES GAINED RESULTS */}
                        {source !== 'SHOT_DOCTOR' && source !== 'MANUAL' && recommendation && (
                            <>
                                <Card variant="filled" className="bg-orange-50 border-orange-200">
                                    <Text variant="caption" className="font-bold text-orange-800 uppercase tracking-widest mb-2">Primary Focus Area</Text>
                                    <div className="flex items-center justify-between mb-2">
                                        <Text variant="h2" className="text-gray-900">{recommendation.focusArea.replace('_', ' ')}</Text>
                                        <Badge variant="error" className="bg-red-100 text-red-700">Needs Work</Badge>
                                    </div>
                                    <Text className="text-sm text-gray-700 leading-relaxed mb-4">
                                        {recommendation.reasoning}
                                    </Text>
                                </Card>

                                <div className="space-y-3">
                                    <Text variant="h4" className="text-sm uppercase text-gray-400 font-bold tracking-widest">Recommended Plan</Text>
                                    {recommendation.recommendedCourseId && (
                                        <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 cursor-pointer hover:border-orange-500 transition-colors shadow-sm">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                {(() => {
                                                    const c = MOCK_COURSES.find(co => co.id === recommendation.recommendedCourseId);
                                                    return c ? <img src={c.thumbnailUrl} className="w-full h-full object-cover" /> : <div className="bg-gray-800 w-full h-full"/>
                                                })()}
                                            </div>
                                            <div className="flex-1">
                                                <Badge variant="info" className="text-[10px] py-0 mb-1">Course</Badge>
                                                <Text variant="body" className="font-bold text-sm leading-tight mb-1">
                                                    {MOCK_COURSES.find(co => co.id === recommendation.recommendedCourseId)?.title}
                                                </Text>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-white safe-area-bottom">
                {step === 'SELECT_SOURCE' && (
                    <Button fullWidth variant="ghost" onClick={onClose}>Cancel</Button>
                )}
                {(step === 'INPUT_DATA' || step === 'MANUAL_SCORE') && (
                    <Button fullWidth onClick={source === 'MANUAL' ? handleComplete : processData} icon={<Icons.ArrowRight />}>
                        {source === 'MANUAL' ? 'Log Round' : 'Analyze Data'}
                    </Button>
                )}
                {step === 'RECOMMENDATION' && (
                    <Button 
                        fullWidth 
                        onClick={handleComplete}
                        variant="primary"
                    >
                        {source === 'SHOT_DOCTOR' ? 'Save Shot' : 'Save & Start Practice'}
                    </Button>
                )}
            </div>
        </div>
    );
};
