/**
 * Swing Analysis Service
 *
 * Comprehensive AI-powered golf swing analysis using Google Gemini's
 * visual understanding and robotics capabilities.
 *
 * Pipeline:
 * 1. Video Upload & Auto-Trim (detect swing start/end)
 * 2. P1-P10 Position Detection (tag exact frames)
 * 3. Frame Extraction & Skeleton Overlay
 * 4. Angle Measurement & Comparison to Ideals
 * 5. AI Coaching Feedback per Position
 * 6. Overall Report with Recommendations & Drills
 */

import { GoogleGenAI, Type, Modality } from "@google/genai";
import {
    SwingPositionId,
    SwingPositionDefinition,
    DetectedPosition,
    SkeletonJointData,
    SkeletonJoint,
    SkeletonConnection,
    MeasuredAngle,
    PositionCoachingFeedback,
    AnalysisPipelineStage,
    AnalysisPipelineState,
    VideoTrimResult,
    FullSwingAnalysis,
    CoachingRecommendation,
    RecommendedDrill,
} from "../types";

// ============================================================
// GEMINI CLIENT
// ============================================================

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const VISION_MODEL = 'gemini-2.5-pro-preview-06-05';
const FAST_MODEL = 'gemini-2.5-flash-preview-05-20';

// ============================================================
// P1-P10 SWING POSITION DEFINITIONS
// Based on dochertygolf.com's canonical P-system
// ============================================================

export const SWING_POSITIONS: SwingPositionDefinition[] = [
    {
        id: 'P1',
        name: 'Setup',
        fullName: 'P1 - Setup / Address',
        description: 'Stance should be closed, right knee should be flexed more than left knee, lower/mid spine should be neutral and the cervical spine and head should be angled down. Shoulders should be slightly open. The right arm should be slightly flexed and left arm should be straight.',
        checkpoints: [
            'Stance width appropriate for club',
            'Right knee flexed more than left',
            'Spine neutral with slight forward tilt',
            'Head angled down, eyes on ball',
            'Shoulders slightly open',
            'Right arm slightly flexed, left arm straight',
            'Weight distribution 50/50 or slightly favoring trail foot',
            'Hands positioned under chin or slightly forward'
        ],
        idealAngles: [
            { name: 'Spine Tilt', min: 25, max: 40, ideal: 33 },
            { name: 'Knee Flex', min: 15, max: 30, ideal: 22 },
            { name: 'Hip Hinge', min: 30, max: 45, ideal: 38 },
            { name: 'Arm Hang', min: 0, max: 15, ideal: 8 }
        ]
    },
    {
        id: 'P2',
        name: 'Shaft Parallel (Backswing)',
        fullName: 'P2 - Club Shaft Parallel to Ground in Backswing',
        description: 'The clubshaft and left arm should be parallel to the target line & just outside of the tip of the left shoe. The right knee is beginning to lose flex while the left knee is gaining flex. He is taking the club back with his right wrist bending like shaking hands, and his right elbow flexing, and right forearm fanning to the right of the elbow while the right forearm traces the baseline of the plane.',
        checkpoints: [
            'Club shaft parallel to ground and target line',
            'Club head just outside left shoe tip',
            'Right wrist hinging (shaking hands motion)',
            'Right elbow beginning to flex',
            'Right forearm fanning to right of elbow',
            'Left arm remains straight',
            'Torso remains inclined at P1 inclination',
            'Weight shifting to trail side'
        ],
        idealAngles: [
            { name: 'Wrist Hinge', min: 20, max: 40, ideal: 30 },
            { name: 'Shoulder Turn', min: 25, max: 45, ideal: 35 },
            { name: 'Hip Turn', min: 5, max: 20, ideal: 12 },
            { name: 'Left Arm Extension', min: 170, max: 180, ideal: 178 }
        ]
    },
    {
        id: 'P3',
        name: 'Left Arm Parallel (Backswing)',
        fullName: 'P3 - Left Arm Parallel to Ground in Backswing',
        description: 'The elbows should be level to the ground, the clubshaft pointing at the baseline of the plane, the clubshaft should be bisecting the bicep, the right knee should still be flexed, the left arm should be angled inside the baseline 20 degrees.',
        checkpoints: [
            'Elbows level to ground',
            'Club shaft pointing at baseline of plane',
            'Club shaft bisecting the right bicep',
            'Right knee maintaining flex',
            'Left arm angled 20° inside baseline',
            'Wrists fully hinged',
            'Torso rotation approximately 45°',
            'Weight predominantly on trail side'
        ],
        idealAngles: [
            { name: 'Shoulder Turn', min: 55, max: 75, ideal: 65 },
            { name: 'Hip Turn', min: 20, max: 35, ideal: 28 },
            { name: 'Wrist Cock', min: 70, max: 100, ideal: 85 },
            { name: 'Spine Tilt', min: 25, max: 40, ideal: 33 }
        ]
    },
    {
        id: 'P4',
        name: 'Top of Backswing',
        fullName: 'P4 - Top of the Backswing',
        description: 'The hands should be deeper than the right shoulder but the right glute should be the deepest. The right knee should have straightened but not locked-out. The left side of the torso and left thigh should almost form a 90 degree angle. The spine has gone from flexed(rounded) at P3 to extended with the back to the target by P4. This spine extension moves the left ear from 2-5" behind the ball at P3 to on the ball by P4.',
        checkpoints: [
            'Hands deeper than right shoulder',
            'Right glute is the deepest point',
            'Right knee straightened but not locked',
            'Left torso and left thigh form ~90° angle',
            'Spine extended, back facing target',
            'Left ear over the ball',
            'Full shoulder turn (90°+)',
            'Left wrist flat or slightly bowed',
            'Club shaft pointing at or parallel to target'
        ],
        idealAngles: [
            { name: 'Shoulder Turn', min: 85, max: 110, ideal: 95 },
            { name: 'Hip Turn', min: 35, max: 55, ideal: 45 },
            { name: 'Left Wrist Angle', min: 170, max: 195, ideal: 180 },
            { name: 'Right Elbow Angle', min: 75, max: 100, ideal: 90 },
            { name: 'X-Factor', min: 35, max: 55, ideal: 45 }
        ]
    },
    {
        id: 'P5',
        name: 'Left Arm Parallel (Downswing)',
        fullName: 'P5 - Left Arm Parallel to Ground in Downswing',
        description: 'From P4 to P4.5 the left side of the torso and the left leg has moved over the left foot with the hands still above the shoulder (the 4.5 launch pad). At P4.5 the left shoulder should begin going up, right shoulder down, and the left knee beginning to straighten while the head stays put. The left arm should be pinned on the upper part of the left pec with no pulling or pushing down with the hands/arms. Left wrist should be cocked maximum.',
        checkpoints: [
            'Left side moved over left foot',
            'Hands still above shoulder level',
            'Left shoulder beginning to go up',
            'Right shoulder moving down',
            'Left knee beginning to straighten',
            'Head remains stable (no lateral movement)',
            'Left arm pinned on upper left pec',
            'Left wrist at maximum cock',
            'Significant lag maintained',
            'Hip clearance well ahead of shoulders'
        ],
        idealAngles: [
            { name: 'Lag Angle', min: 60, max: 90, ideal: 75 },
            { name: 'Hip Rotation', min: 25, max: 45, ideal: 35 },
            { name: 'Shoulder Tilt', min: 20, max: 40, ideal: 30 },
            { name: 'Knee Flex (Lead)', min: 10, max: 25, ideal: 18 }
        ]
    },
    {
        id: 'P6',
        name: 'Shaft Parallel (Downswing)',
        fullName: 'P6 - Club Shaft Parallel to Ground in Downswing',
        description: 'The left knee should continue to straighten as the left shoulder continues to go up and the right shoulder goes down. The motion of the shoulders/hips/left knee should be transporting the arms with the right elbow flexed 120 degrees and the pressure points on the right humerus connected to the torso just above the belt. Left wrist still remains cocked.',
        checkpoints: [
            'Left knee continuing to straighten',
            'Left shoulder going up, right shoulder down',
            'Arms being transported by body rotation',
            'Right elbow flexed ~120°',
            'Right humerus connected to torso above belt',
            'Left wrist remains cocked',
            'Club approaching from inside',
            'Shaft on or slightly below plane',
            'Weight predominantly on lead side'
        ],
        idealAngles: [
            { name: 'Right Elbow', min: 100, max: 140, ideal: 120 },
            { name: 'Hip Rotation', min: 35, max: 55, ideal: 45 },
            { name: 'Shoulder Rotation', min: 10, max: 30, ideal: 20 },
            { name: 'Lag Retention', min: 45, max: 75, ideal: 60 }
        ]
    },
    {
        id: 'P7',
        name: 'Impact',
        fullName: 'P7 - Impact',
        description: 'The left knee should be straight and the left shoulder continues to go up and slightly back away from the target from P6.5 to P7 as the right shoulder goes down. The right elbow should still be flexed and the pressure points on the right humerus should still be on the torso just above the belt. The left wrist uncocks due to parametric acceleration and not right arm thrust.',
        checkpoints: [
            'Left knee straight (posted up)',
            'Left shoulder up and slightly back from target',
            'Right shoulder moving down',
            'Right elbow still slightly flexed',
            'Right humerus pressure on torso above belt',
            'Left wrist uncocked via parametric acceleration',
            'Hips open 40-45° to target',
            'Head behind the ball',
            'Shaft lean forward (hands ahead of club head)',
            'Weight 80%+ on lead side'
        ],
        idealAngles: [
            { name: 'Hip Open', min: 35, max: 50, ideal: 42 },
            { name: 'Shoulder Open', min: 0, max: 15, ideal: 8 },
            { name: 'Shaft Lean', min: 8, max: 20, ideal: 14 },
            { name: 'Spine Tilt', min: 15, max: 35, ideal: 25 },
            { name: 'Left Knee Extension', min: 165, max: 180, ideal: 175 }
        ]
    },
    {
        id: 'P8',
        name: 'Shaft Parallel (Follow Through)',
        fullName: 'P8 - Club Shaft Parallel to Ground in Follow Through',
        description: 'The left shoulder moves up and back away from the target so that the left shoulder is behind where the ball sat. The right shoulder moves down and in front of where the ball sat. The left ear should be behind where the ball sat. The right foot should only have its heel lifted off the ground slightly.',
        checkpoints: [
            'Left shoulder behind ball position',
            'Right shoulder in front of ball position',
            'Left ear behind ball position',
            'Right foot heel slightly lifted',
            'Arms fully extended',
            'Club face rotated naturally through release',
            'Body still rotating through',
            'Spine tilt maintained from impact'
        ],
        idealAngles: [
            { name: 'Arm Extension', min: 165, max: 180, ideal: 175 },
            { name: 'Body Rotation', min: 55, max: 75, ideal: 65 },
            { name: 'Spine Tilt', min: 20, max: 40, ideal: 30 },
            { name: 'Right Foot Lift', min: 5, max: 25, ideal: 15 }
        ]
    },
    {
        id: 'P9',
        name: 'Right Arm Parallel (Follow Through)',
        fullName: 'P9 - Right Arm Parallel to Ground in Follow Through',
        description: 'In famous swings like Ben Hogan & Mac O\'Grady, their P8 & P9 happens at the same time and this is very true with all players that use the Swinging Method. The Hitting Method fires their trail arm off a stationary right shoulder and they will run out of right arm soon after impact and will have distinctly different P8 and P9 alignments.',
        checkpoints: [
            'Right arm parallel to ground',
            'Full extension achieved',
            'Club wrapping around body',
            'Swingers: P8 & P9 happen simultaneously',
            'Hitters: distinct P8 and P9 positions',
            'Body continues to rotate',
            'Right foot up on toe',
            'Belt buckle approaching target'
        ],
        idealAngles: [
            { name: 'Body Rotation', min: 70, max: 95, ideal: 82 },
            { name: 'Right Arm Extension', min: 160, max: 180, ideal: 172 },
            { name: 'Hip Rotation', min: 65, max: 85, ideal: 75 },
            { name: 'Spine Angle', min: 15, max: 35, ideal: 25 }
        ]
    },
    {
        id: 'P10',
        name: 'Finish',
        fullName: 'P10 - Finish',
        description: 'The left shoulder should be well behind where the ball sat and the belt buckle should be pushed forward toward the target. This will place most of the pressure in the ground on the outside edge of your left foot with your center of mass back and only supported by the tippy toe of the right shoe. The hips should be level to the ground, the right ear lower than the left ear, and the left elbow below the left shoulder. The thighs should be sealed together with no gaps.',
        checkpoints: [
            'Left shoulder well behind ball position',
            'Belt buckle facing target',
            'Weight on outside edge of left foot',
            'Right foot on tippy toe only',
            'Hips level to the ground',
            'Right ear lower than left ear',
            'Left elbow below left shoulder',
            'Thighs sealed together, no gaps',
            'Balanced finish held for 3+ seconds',
            'Club shaft behind the head/neck'
        ],
        idealAngles: [
            { name: 'Hip Rotation', min: 80, max: 100, ideal: 90 },
            { name: 'Shoulder Rotation', min: 100, max: 130, ideal: 115 },
            { name: 'Spine Tilt', min: 10, max: 30, ideal: 20 },
            { name: 'Balance', min: 85, max: 100, ideal: 95 }
        ]
    }
];

// ============================================================
// SKELETON CONNECTIONS (for drawing overlay)
// ============================================================

export const SKELETON_CONNECTIONS: SkeletonConnection[] = [
    // Head & Spine
    { from: 'HEAD', to: 'NECK', color: '#FFD700' },
    { from: 'NECK', to: 'SPINE_MID', color: '#FFD700' },
    { from: 'SPINE_MID', to: 'SPINE_BASE', color: '#FFD700' },
    // Shoulders
    { from: 'NECK', to: 'LEFT_SHOULDER', color: '#00BFFF' },
    { from: 'NECK', to: 'RIGHT_SHOULDER', color: '#FF6347' },
    // Left arm
    { from: 'LEFT_SHOULDER', to: 'LEFT_ELBOW', color: '#00BFFF' },
    { from: 'LEFT_ELBOW', to: 'LEFT_WRIST', color: '#00BFFF' },
    { from: 'LEFT_WRIST', to: 'LEFT_HAND', color: '#00BFFF' },
    // Right arm
    { from: 'RIGHT_SHOULDER', to: 'RIGHT_ELBOW', color: '#FF6347' },
    { from: 'RIGHT_ELBOW', to: 'RIGHT_WRIST', color: '#FF6347' },
    { from: 'RIGHT_WRIST', to: 'RIGHT_HAND', color: '#FF6347' },
    // Hips
    { from: 'SPINE_BASE', to: 'LEFT_HIP', color: '#00BFFF' },
    { from: 'SPINE_BASE', to: 'RIGHT_HIP', color: '#FF6347' },
    // Left leg
    { from: 'LEFT_HIP', to: 'LEFT_KNEE', color: '#00BFFF' },
    { from: 'LEFT_KNEE', to: 'LEFT_ANKLE', color: '#00BFFF' },
    // Right leg
    { from: 'RIGHT_HIP', to: 'RIGHT_KNEE', color: '#FF6347' },
    { from: 'RIGHT_KNEE', to: 'RIGHT_ANKLE', color: '#FF6347' },
    // Club
    { from: 'LEFT_HAND', to: 'CLUB_GRIP', color: '#32CD32' },
    { from: 'CLUB_GRIP', to: 'CLUB_SHAFT_MID', color: '#32CD32' },
    { from: 'CLUB_SHAFT_MID', to: 'CLUB_HEAD', color: '#32CD32' },
];

// ============================================================
// GEMINI AI ANALYSIS FUNCTIONS
// ============================================================

/**
 * Step 1: Analyze video to detect swing boundaries (auto-trim)
 * Uses Gemini's visual understanding to find the actual swing
 * within a longer video clip.
 */
export async function detectSwingBoundaries(
    videoData: string,
    mimeType: string
): Promise<VideoTrimResult> {
    try {
        const response = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: {
                parts: [
                    { inlineData: { mimeType, data: videoData } },
                    {
                        text: `You are an expert golf swing analyst. Analyze this video and detect the exact timing of the golf swing.

Find:
1. The frame/timestamp where the golfer begins their takeaway (the moment the club first moves back from address)
2. The frame/timestamp where the swing finishes (the golfer reaches their final balanced position)

Also determine the total video duration and your confidence that a valid golf swing is present.

Return a JSON object with:
- originalDuration: total video length in seconds
- trimmedStartTime: start of swing in seconds (0.5-1 second before takeaway)
- trimmedEndTime: end of swing in seconds (0.5 seconds after finish)
- trimmedDuration: trimmedEndTime - trimmedStartTime
- swingDetected: boolean whether a valid golf swing was found
- confidence: 0-1 confidence score`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        originalDuration: { type: Type.NUMBER },
                        trimmedStartTime: { type: Type.NUMBER },
                        trimmedEndTime: { type: Type.NUMBER },
                        trimmedDuration: { type: Type.NUMBER },
                        swingDetected: { type: Type.BOOLEAN },
                        confidence: { type: Type.NUMBER }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error('No response from swing detection');
    } catch (error) {
        console.error('Swing boundary detection failed:', error);
        // Return a fallback that uses the full video
        return {
            originalDuration: 5,
            trimmedStartTime: 0,
            trimmedEndTime: 5,
            trimmedDuration: 5,
            swingDetected: false,
            confidence: 0
        };
    }
}

/**
 * Step 2: Detect P1-P10 positions within the trimmed swing video
 * Returns timestamps for each key position frame.
 */
export async function detectSwingPositions(
    videoData: string,
    mimeType: string,
    trimStart: number,
    trimEnd: number
): Promise<{ positionId: SwingPositionId; timestamp: number; confidence: number }[]> {
    try {
        const positionDescriptions = SWING_POSITIONS.map(p =>
            `${p.id} (${p.name}): ${p.description.substring(0, 100)}...`
        ).join('\n');

        const response = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: {
                parts: [
                    { inlineData: { mimeType, data: videoData } },
                    {
                        text: `You are an expert golf biomechanics analyst trained in the P-System (P1-P10) of golf swing positions.

The swing occurs between ${trimStart.toFixed(2)}s and ${trimEnd.toFixed(2)}s in this video.

Identify the EXACT timestamp (in seconds) for each of these 10 key positions:

${positionDescriptions}

For each position, provide:
- positionId: P1 through P10
- timestamp: exact time in seconds within the video
- confidence: 0.0 to 1.0 how confident you are the position was correctly identified

Return a JSON array of objects sorted by timestamp. All 10 positions should be identified even if confidence is low.`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            positionId: { type: Type.STRING },
                            timestamp: { type: Type.NUMBER },
                            confidence: { type: Type.NUMBER }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error('No response from position detection');
    } catch (error) {
        console.error('Position detection failed:', error);
        return [];
    }
}

/**
 * Step 3: Analyze a specific frame for pose estimation and angles.
 * Uses Gemini's spatial understanding to identify body landmarks
 * and the club position.
 */
export async function analyzeFramePose(
    frameImageData: string,
    positionId: SwingPositionId
): Promise<{
    skeleton: SkeletonJointData[];
    angles: MeasuredAngle[];
}> {
    const positionDef = SWING_POSITIONS.find(p => p.id === positionId);

    try {
        const response = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: frameImageData } },
                    {
                        text: `You are an expert golf biomechanics analyst with computer vision expertise.

This frame shows a golf swing at position ${positionId} (${positionDef?.name || ''}).

TASK 1 - SKELETON DETECTION:
Identify the pixel coordinates (x, y as 0-1 normalized) for these body joints and the golf club:
HEAD, NECK, LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_ELBOW, RIGHT_ELBOW, LEFT_WRIST, RIGHT_WRIST, LEFT_HIP, RIGHT_HIP, LEFT_KNEE, RIGHT_KNEE, LEFT_ANKLE, RIGHT_ANKLE, SPINE_MID, SPINE_BASE, LEFT_HAND, RIGHT_HAND, CLUB_GRIP, CLUB_SHAFT_MID, CLUB_HEAD

For each joint provide: joint name, x (0-1), y (0-1), confidence (0-1), visible (boolean).

TASK 2 - ANGLE MEASUREMENTS:
Measure these key angles for ${positionId}:
${positionDef?.idealAngles.map(a => `- ${a.name} (ideal: ${a.ideal}°, range: ${a.min}-${a.max}°)`).join('\n') || 'Standard swing angles'}

For each angle provide: name, measured value in degrees, ideal min/max/value, and status (EXCELLENT if within 5° of ideal, GOOD if within range, NEEDS_WORK if 5-15° outside range, CRITICAL if >15° outside range).

Return JSON with two arrays: "skeleton" and "angles".`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        skeleton: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    joint: { type: Type.STRING },
                                    x: { type: Type.NUMBER },
                                    y: { type: Type.NUMBER },
                                    confidence: { type: Type.NUMBER },
                                    visible: { type: Type.BOOLEAN }
                                }
                            }
                        },
                        angles: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    value: { type: Type.NUMBER },
                                    idealMin: { type: Type.NUMBER },
                                    idealMax: { type: Type.NUMBER },
                                    idealValue: { type: Type.NUMBER },
                                    status: { type: Type.STRING },
                                    jointA: { type: Type.STRING },
                                    jointB: { type: Type.STRING },
                                    jointC: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error('No response from pose analysis');
    } catch (error) {
        console.error(`Pose analysis failed for ${positionId}:`, error);
        return { skeleton: [], angles: [] };
    }
}

/**
 * Step 4: Generate detailed coaching feedback for a specific position
 */
export async function generatePositionCoaching(
    frameImageData: string,
    positionId: SwingPositionId,
    measuredAngles: MeasuredAngle[]
): Promise<PositionCoachingFeedback[]> {
    const positionDef = SWING_POSITIONS.find(p => p.id === positionId);

    try {
        const anglesSummary = measuredAngles.map(a =>
            `${a.name}: ${a.value}° (ideal: ${a.idealValue}°, status: ${a.status})`
        ).join('\n');

        const response = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: frameImageData } },
                    {
                        text: `You are an elite PGA-level golf coach analyzing a student's swing at position ${positionId} (${positionDef?.name || ''}).

Position Description: ${positionDef?.description || ''}

Key Checkpoints for this position:
${positionDef?.checkpoints.map((c, i) => `${i + 1}. ${c}`).join('\n') || ''}

Measured angles:
${anglesSummary}

Analyze this frame and provide detailed coaching feedback. For each issue found:
1. Categorize it (POSTURE, GRIP, ALIGNMENT, PLANE, ROTATION, WEIGHT_SHIFT, WRIST, HEAD, BALANCE, TEMPO, CLUB_FACE, CLUB_PATH)
2. Rate severity (INFO for good form notes, TIP for minor improvements, WARNING for issues affecting consistency, CRITICAL for issues causing major faults)
3. Provide a clear title (e.g., "Hands too inside", "Club face open", "Loss of posture")
4. Describe what you see
5. Explain the correction needed
6. Suggest a pro player reference whose position to emulate

Be specific and actionable. Think like Butch Harmon, Sean Foley, or Pete Cowen giving a lesson.

Return a JSON array of coaching feedback items.`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            category: { type: Type.STRING },
                            severity: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            correction: { type: Type.STRING },
                            proReference: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const items = JSON.parse(response.text);
            return items.map((item: any) => ({
                ...item,
                id: item.id || crypto.randomUUID()
            }));
        }
        return [];
    } catch (error) {
        console.error(`Coaching generation failed for ${positionId}:`, error);
        return [];
    }
}

/**
 * Step 5: Generate overall swing report with recommendations and drills
 */
export async function generateSwingReport(
    positions: DetectedPosition[],
    clubUsed: string,
    cameraAngle: string
): Promise<{
    overallScore: number;
    overallGrade: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: CoachingRecommendation[];
    drills: RecommendedDrill[];
}> {
    try {
        const positionSummaries = positions.map(p => {
            const anglesSummary = p.angles.map(a => `${a.name}: ${a.value}° (${a.status})`).join(', ');
            const feedbackSummary = p.coaching.map(c => `[${c.severity}] ${c.title}`).join(', ');
            return `${p.positionId} (Grade: ${p.overallGrade}): Angles: ${anglesSummary}. Feedback: ${feedbackSummary}`;
        }).join('\n\n');

        const response = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: {
                parts: [
                    {
                        text: `You are an elite golf swing analyst creating a comprehensive report.

Club: ${clubUsed}
Camera Angle: ${cameraAngle}

Position-by-Position Analysis:
${positionSummaries}

Generate a comprehensive swing analysis report:

1. OVERALL SCORE (0-100) and GRADE (A/B/C/D/F)
2. TOP 3 STRENGTHS of this swing
3. TOP 3 WEAKNESSES that need improvement
4. PRIORITIZED RECOMMENDATIONS (3-5) with:
   - Priority (HIGH/MEDIUM/LOW)
   - Category
   - Clear title and description
   - Which P-positions are affected
   - Estimated impact on the swing
5. RECOMMENDED DRILLS (3-5) with:
   - Name, description, category, difficulty
   - Duration, step-by-step instructions
   - Which P-positions it targets
   - Expected improvement

Be specific, actionable, and encourage the player while being honest about areas for improvement.`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallScore: { type: Type.NUMBER },
                        overallGrade: { type: Type.STRING },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    priority: { type: Type.STRING },
                                    category: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    positionRefs: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    drillIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    estimatedImpact: { type: Type.STRING }
                                }
                            }
                        },
                        drills: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    category: { type: Type.STRING },
                                    difficulty: { type: Type.STRING },
                                    duration: { type: Type.STRING },
                                    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    targetPositions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    expectedImprovement: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error('No response from report generation');
    } catch (error) {
        console.error('Report generation failed:', error);
        return {
            overallScore: 0,
            overallGrade: 'F',
            strengths: [],
            weaknesses: ['Analysis could not be completed'],
            recommendations: [],
            drills: []
        };
    }
}

/**
 * Generate AI narration of the swing analysis as audio
 */
export async function generateAnalysisNarration(
    analysis: FullSwingAnalysis
): Promise<string | null> {
    try {
        const script = buildNarrationScript(analysis);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: script }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Fenrir' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error('Audio narration failed:', error);
        return null;
    }
}

function buildNarrationScript(analysis: FullSwingAnalysis): string {
    let script = `Here's your swing analysis for your ${analysis.clubUsed} shot.\n\n`;
    script += `Overall, I'd give this swing a score of ${analysis.overallScore} out of 100, which earns a grade of ${analysis.overallGrade}.\n\n`;

    if (analysis.strengths.length > 0) {
        script += `Let's start with what you're doing well. ${analysis.strengths.join('. ')}.\n\n`;
    }

    if (analysis.weaknesses.length > 0) {
        script += `Now let's talk about areas for improvement. ${analysis.weaknesses.join('. ')}.\n\n`;
    }

    if (analysis.recommendations.length > 0) {
        script += `My top recommendation is: ${analysis.recommendations[0].title}. ${analysis.recommendations[0].description}\n\n`;
    }

    if (analysis.drills.length > 0) {
        script += `To improve, I'd suggest the ${analysis.drills[0].name} drill. ${analysis.drills[0].description}`;
    }

    return script;
}

/**
 * Generate text-based AI coaching review
 */
export async function generateTextReview(
    analysis: FullSwingAnalysis
): Promise<string> {
    try {
        const positionSummaries = analysis.positions.map(p => {
            return `${p.positionId} (${SWING_POSITIONS.find(sp => sp.id === p.positionId)?.name}): Grade ${p.overallGrade}, ${p.coaching.length} feedback items`;
        }).join('\n');

        const response = await ai.models.generateContent({
            model: FAST_MODEL,
            contents: [{
                parts: [{
                    text: `You are an elite golf coach writing a detailed but encouraging swing review.

Club: ${analysis.clubUsed}
Overall Score: ${analysis.overallScore}/100 (${analysis.overallGrade})
Camera: ${analysis.cameraAngle}

Positions:
${positionSummaries}

Strengths: ${analysis.strengths.join(', ')}
Weaknesses: ${analysis.weaknesses.join(', ')}
Top Recommendations: ${analysis.recommendations.map(r => r.title).join(', ')}

Write a detailed, professional swing review as if you're a top coach writing to your student. Include:
1. Opening assessment
2. Position-by-position highlights (focus on key issues, not all 10)
3. Priority areas for improvement
4. Specific practice plan
5. Encouragement and next steps

Keep it conversational but professional. Use golf terminology accurately.`
                }]
            }]
        });

        return response.text || 'Review could not be generated.';
    } catch (error) {
        console.error('Text review failed:', error);
        return 'Unable to generate review at this time.';
    }
}

// ============================================================
// FRAME EXTRACTION UTILITIES
// ============================================================

/**
 * Extract a frame from a video at a specific timestamp
 * Returns base64 encoded JPEG
 */
export function extractFrameFromVideo(
    video: HTMLVideoElement,
    timestamp: number,
    width?: number,
    height?: number
): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const w = width || video.videoWidth;
        const h = height || video.videoHeight;
        canvas.width = w;
        canvas.height = h;

        const savedTime = video.currentTime;
        video.currentTime = timestamp;

        const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            ctx.drawImage(video, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            // Return just the base64 part without the data:image/jpeg;base64, prefix
            const base64 = dataUrl.split(',')[1];
            video.currentTime = savedTime;
            resolve(base64);
        };

        video.addEventListener('seeked', onSeeked);
    });
}

/**
 * Extract a frame and return as full data URL (for display)
 */
export function extractFrameAsDataUrl(
    video: HTMLVideoElement,
    timestamp: number
): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const savedTime = video.currentTime;
        video.currentTime = timestamp;

        const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            ctx.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            video.currentTime = savedTime;
            resolve(dataUrl);
        };

        video.addEventListener('seeked', onSeeked);
    });
}

// ============================================================
// ANGLE CALCULATION UTILITIES
// ============================================================

export function calculateAngleBetweenJoints(
    jointA: { x: number; y: number },
    jointB: { x: number; y: number },
    jointC: { x: number; y: number }
): number {
    const BA = { x: jointA.x - jointB.x, y: jointA.y - jointB.y };
    const BC = { x: jointC.x - jointB.x, y: jointC.y - jointB.y };

    const dotProduct = BA.x * BC.x + BA.y * BC.y;
    const magnitudeBA = Math.sqrt(BA.x * BA.x + BA.y * BA.y);
    const magnitudeBC = Math.sqrt(BC.x * BC.x + BC.y * BC.y);

    if (magnitudeBA === 0 || magnitudeBC === 0) return 0;

    const cosAngle = dotProduct / (magnitudeBA * magnitudeBC);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

    return angle * (180 / Math.PI);
}

/**
 * Grade a position based on its angles and coaching feedback
 */
export function gradePosition(
    angles: MeasuredAngle[],
    coaching: PositionCoachingFeedback[]
): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (angles.length === 0) return 'C';

    const excellentCount = angles.filter(a => a.status === 'EXCELLENT').length;
    const goodCount = angles.filter(a => a.status === 'GOOD').length;
    const criticalCount = angles.filter(a => a.status === 'CRITICAL').length;
    const criticalFeedback = coaching.filter(c => c.severity === 'CRITICAL').length;

    const total = angles.length;
    const score = (excellentCount * 4 + goodCount * 3) / (total * 4);

    if (criticalCount > 0 || criticalFeedback > 1) return score > 0.5 ? 'D' : 'F';
    if (score >= 0.85) return 'A';
    if (score >= 0.7) return 'B';
    if (score >= 0.5) return 'C';
    return 'D';
}

// ============================================================
// SKELETON DRAWING UTILITY
// ============================================================

export function drawSkeleton(
    ctx: CanvasRenderingContext2D,
    joints: SkeletonJointData[],
    canvasWidth: number,
    canvasHeight: number,
    options: {
        jointRadius?: number;
        lineWidth?: number;
        showJointLabels?: boolean;
        opacity?: number;
        highlightClub?: boolean;
    } = {}
) {
    const {
        jointRadius = 5,
        lineWidth = 3,
        showJointLabels = false,
        opacity = 0.9,
        highlightClub = true
    } = options;

    ctx.save();
    ctx.globalAlpha = opacity;

    // Draw connections
    SKELETON_CONNECTIONS.forEach(conn => {
        const from = joints.find(j => j.joint === conn.from);
        const to = joints.find(j => j.joint === conn.to);
        if (!from || !to || !from.visible || !to.visible) return;

        const x1 = from.x * canvasWidth;
        const y1 = from.y * canvasHeight;
        const x2 = to.x * canvasWidth;
        const y2 = to.y * canvasHeight;

        ctx.beginPath();
        ctx.strokeStyle = conn.color || '#FFFFFF';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';

        // Club gets special treatment
        if (highlightClub && (conn.from.startsWith('CLUB') || conn.to.startsWith('CLUB'))) {
            ctx.lineWidth = lineWidth + 2;
            ctx.setLineDash([]);
            ctx.shadowColor = conn.color || '#32CD32';
            ctx.shadowBlur = 6;
        }

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    });

    // Draw joints
    joints.forEach(joint => {
        if (!joint.visible) return;

        const x = joint.x * canvasWidth;
        const y = joint.y * canvasHeight;

        const isClub = joint.joint.startsWith('CLUB');
        const r = isClub ? jointRadius + 2 : jointRadius;

        // Outer ring
        ctx.beginPath();
        ctx.fillStyle = isClub ? '#32CD32' : '#FFFFFF';
        ctx.arc(x, y, r + 1, 0, 2 * Math.PI);
        ctx.fill();

        // Inner dot
        ctx.beginPath();
        ctx.fillStyle = isClub ? '#00FF00' :
            joint.joint.startsWith('LEFT') ? '#00BFFF' :
            joint.joint.startsWith('RIGHT') ? '#FF6347' : '#FFD700';
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();

        // Label
        if (showJointLabels) {
            ctx.font = '9px sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(joint.joint.replace(/_/g, ' '), x, y - r - 4);
        }
    });

    ctx.restore();
}

/**
 * Draw angle measurement arc on canvas
 */
export function drawAngleMeasurement(
    ctx: CanvasRenderingContext2D,
    jointA: { x: number; y: number },
    jointB: { x: number; y: number },
    jointC: { x: number; y: number },
    angle: number,
    canvasWidth: number,
    canvasHeight: number,
    status: string,
    label?: string
) {
    const ax = jointA.x * canvasWidth;
    const ay = jointA.y * canvasHeight;
    const bx = jointB.x * canvasWidth;
    const by = jointB.y * canvasHeight;
    const cx = jointC.x * canvasWidth;
    const cy = jointC.y * canvasHeight;

    const statusColors: Record<string, string> = {
        'EXCELLENT': '#22C55E',
        'GOOD': '#3B82F6',
        'NEEDS_WORK': '#F59E0B',
        'CRITICAL': '#EF4444'
    };

    const color = statusColors[status] || '#FFFFFF';

    // Draw the angle arc
    const startAngle = Math.atan2(ay - by, ax - bx);
    const endAngle = Math.atan2(cy - by, cx - bx);
    const arcRadius = 25;

    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, arcRadius, startAngle, endAngle, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw angle text
    const midAngle = (startAngle + endAngle) / 2;
    const textX = bx + Math.cos(midAngle) * (arcRadius + 15);
    const textY = by + Math.sin(midAngle) * (arcRadius + 15);

    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(angle)}°`, textX, textY);

    if (label) {
        ctx.font = '9px sans-serif';
        ctx.fillText(label, textX, textY + 14);
    }

    ctx.restore();
}

// ============================================================
// MOCK DATA GENERATOR (for development/demo)
// ============================================================

export function generateMockAnalysis(videoUrl: string, thumbnailUrl: string): FullSwingAnalysis {
    const mockPositions: DetectedPosition[] = SWING_POSITIONS.map((pos, idx) => ({
        positionId: pos.id,
        frameNumber: idx * 8 + Math.floor(Math.random() * 3),
        timestamp: idx * 0.35 + 0.2,
        confidence: 0.82 + Math.random() * 0.15,
        screenshotDataUrl: thumbnailUrl,
        skeletonData: generateMockSkeleton(pos.id),
        angles: pos.idealAngles.map(ideal => {
            const variance = (Math.random() - 0.5) * 20;
            const value = ideal.ideal + variance;
            const diff = Math.abs(value - ideal.ideal);
            return {
                name: ideal.name,
                value: Math.round(value * 10) / 10,
                idealMin: ideal.min,
                idealMax: ideal.max,
                idealValue: ideal.ideal,
                status: (diff <= 5 ? 'EXCELLENT' : diff <= 10 ? 'GOOD' : diff <= 15 ? 'NEEDS_WORK' : 'CRITICAL') as MeasuredAngle['status'],
                jointA: 'LEFT_SHOULDER' as SkeletonJoint,
                jointB: 'SPINE_MID' as SkeletonJoint,
                jointC: 'LEFT_HIP' as SkeletonJoint,
            };
        }),
        coaching: generateMockCoaching(pos.id),
        overallGrade: (['A', 'A', 'B', 'B', 'A', 'C', 'B', 'A', 'B', 'A'] as const)[idx]
    }));

    return {
        id: crypto.randomUUID(),
        videoUrl,
        thumbnailUrl,
        date: new Date(),
        clubUsed: 'DRIVER',
        shotType: 'Full Swing',
        cameraAngle: 'FACE_ON',
        executionLevel: 4,
        trimResult: {
            originalDuration: 8.5,
            trimmedStartTime: 1.2,
            trimmedEndTime: 5.8,
            trimmedDuration: 4.6,
            swingDetected: true,
            confidence: 0.94
        },
        positions: mockPositions,
        overallScore: 82,
        overallGrade: 'B',
        strengths: [
            'Excellent shoulder turn at the top (P4) showing full coil',
            'Good impact position with hands ahead of clubhead',
            'Balanced finish position with weight fully transferred'
        ],
        weaknesses: [
            'Club face slightly open at P6, contributing to fade tendency',
            'Early extension through impact causing inconsistent contact',
            'Insufficient hip clearance at P7 limiting power transfer'
        ],
        recommendations: [
            {
                id: crypto.randomUUID(),
                priority: 'HIGH',
                category: 'ROTATION',
                title: 'Improve Hip Clearance at Impact',
                description: 'Your hips are only 30° open at impact instead of the ideal 40-45°. This limits power transfer and forces the arms to compensate. Focus on initiating the downswing with a hip bump and rotation.',
                positionRefs: ['P5', 'P6', 'P7'],
                drillIds: ['drill-1'],
                estimatedImpact: 'Could add 8-12 yards to driver distance and improve consistency'
            },
            {
                id: crypto.randomUUID(),
                priority: 'HIGH',
                category: 'CLUB_FACE',
                title: 'Square the Club Face Earlier in Downswing',
                description: 'The club face is open at P6 which requires timing-dependent manipulation to square at impact. Work on forearm rotation in the transition.',
                positionRefs: ['P5', 'P6'],
                drillIds: ['drill-2'],
                estimatedImpact: 'Reduce fade/slice tendency and improve directional control'
            },
            {
                id: crypto.randomUUID(),
                priority: 'MEDIUM',
                category: 'POSTURE',
                title: 'Maintain Spine Angle Through Impact',
                description: 'You\'re losing your spine angle from P5 to P7 (early extension). This pushes you closer to the ball and can cause thin/fat shots.',
                positionRefs: ['P5', 'P6', 'P7'],
                drillIds: ['drill-3'],
                estimatedImpact: 'Improve ball striking consistency by 15-20%'
            }
        ],
        drills: [
            {
                id: 'drill-1',
                name: 'Wall Hip Bump Drill',
                description: 'Stand with your trail hip touching a wall. Practice bumping your lead hip toward the target while keeping your trail hip on the wall. This teaches proper hip clearance.',
                category: 'ROTATION',
                difficulty: 'INTERMEDIATE',
                duration: '10 minutes',
                steps: [
                    'Stand in address position with trail hip touching a wall',
                    'Make a backswing turn',
                    'Initiate downswing by bumping lead hip toward target',
                    'Feel trail hip stay near wall while lead hip clears',
                    'Repeat 20 times, then hit 10 balls focusing on the same feeling'
                ],
                targetPositions: ['P5', 'P6', 'P7'],
                expectedImprovement: 'Better hip clearance leading to 5-10 yard distance gain'
            },
            {
                id: 'drill-2',
                name: 'Split Grip Release Drill',
                description: 'Grip the club with hands 3 inches apart. Make half swings focusing on the trail hand rotating over the lead hand through impact.',
                category: 'CLUB_FACE',
                difficulty: 'BEGINNER',
                duration: '15 minutes',
                steps: [
                    'Grip the club with a 3-inch gap between hands',
                    'Make slow half-backswings to P3',
                    'Focus on trail forearm rotating over lead forearm through impact',
                    'Club face should point to the ground post-impact',
                    'Gradually increase speed over 20 repetitions'
                ],
                targetPositions: ['P5', 'P6', 'P7', 'P8'],
                expectedImprovement: 'Squarer club face at impact, less open face tendency'
            },
            {
                id: 'drill-3',
                name: 'Butt Against Wall Drill',
                description: 'Address the ball with your glutes touching a chair or alignment stick. Maintain contact throughout the swing to prevent early extension.',
                category: 'POSTURE',
                difficulty: 'INTERMEDIATE',
                duration: '10 minutes',
                steps: [
                    'Place a chair or stick behind your glutes at address',
                    'Feel light pressure against it at setup',
                    'Make swings maintaining contact with the chair through impact',
                    'If you lose contact, you\'re early extending',
                    'Start with half swings and build to full'
                ],
                targetPositions: ['P5', 'P6', 'P7'],
                expectedImprovement: 'Maintain spine angle for more consistent ball striking'
            }
        ],
        tags: ['Driver', 'Full Swing', 'Range Session'],
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

function generateMockSkeleton(positionId: SwingPositionId): SkeletonJointData[] {
    // Generate realistic-ish skeleton positions based on the swing position
    const basePositions: Record<string, { x: number; y: number }> = {
        'HEAD': { x: 0.50, y: 0.12 },
        'NECK': { x: 0.50, y: 0.18 },
        'LEFT_SHOULDER': { x: 0.42, y: 0.22 },
        'RIGHT_SHOULDER': { x: 0.58, y: 0.22 },
        'LEFT_ELBOW': { x: 0.35, y: 0.35 },
        'RIGHT_ELBOW': { x: 0.65, y: 0.35 },
        'LEFT_WRIST': { x: 0.38, y: 0.48 },
        'RIGHT_WRIST': { x: 0.62, y: 0.48 },
        'LEFT_HIP': { x: 0.44, y: 0.50 },
        'RIGHT_HIP': { x: 0.56, y: 0.50 },
        'LEFT_KNEE': { x: 0.42, y: 0.68 },
        'RIGHT_KNEE': { x: 0.58, y: 0.68 },
        'LEFT_ANKLE': { x: 0.40, y: 0.88 },
        'RIGHT_ANKLE': { x: 0.60, y: 0.88 },
        'SPINE_MID': { x: 0.50, y: 0.35 },
        'SPINE_BASE': { x: 0.50, y: 0.50 },
        'LEFT_HAND': { x: 0.37, y: 0.50 },
        'RIGHT_HAND': { x: 0.63, y: 0.50 },
        'CLUB_GRIP': { x: 0.50, y: 0.50 },
        'CLUB_SHAFT_MID': { x: 0.50, y: 0.60 },
        'CLUB_HEAD': { x: 0.50, y: 0.72 },
    };

    // Apply position-specific adjustments
    const posIndex = parseInt(positionId.replace('P', '')) - 1;
    const rotationFactor = posIndex <= 4 ? posIndex * 0.03 : (10 - posIndex) * 0.03;

    return Object.entries(basePositions).map(([joint, pos]) => ({
        joint: joint as SkeletonJoint,
        x: Math.max(0.05, Math.min(0.95, pos.x + (Math.random() - 0.5) * 0.04 + (joint.startsWith('RIGHT') ? rotationFactor : -rotationFactor))),
        y: Math.max(0.05, Math.min(0.95, pos.y + (Math.random() - 0.5) * 0.03)),
        confidence: 0.8 + Math.random() * 0.2,
        visible: true
    }));
}

function generateMockCoaching(positionId: SwingPositionId): PositionCoachingFeedback[] {
    const feedbackPool: Record<SwingPositionId, PositionCoachingFeedback[]> = {
        'P1': [
            { id: crypto.randomUUID(), category: 'POSTURE', severity: 'TIP', title: 'Good athletic setup', description: 'Your address position shows good balance and readiness.', correction: 'Slight improvement: try widening stance by 1 inch for more stability.', proReference: 'Rory McIlroy' },
            { id: crypto.randomUUID(), category: 'ALIGNMENT', severity: 'INFO', title: 'Shoulders slightly open', description: 'Shoulders are aligned slightly left of target which is acceptable for a fade bias.', correction: 'If drawing is the goal, close shoulders slightly.', proReference: 'Tiger Woods' }
        ],
        'P2': [
            { id: crypto.randomUUID(), category: 'PLANE', severity: 'TIP', title: 'Takeaway on plane', description: 'Club is tracking well parallel to the target line.', correction: 'Maintain this path by keeping the triangle intact.', proReference: 'Ben Hogan' },
        ],
        'P3': [
            { id: crypto.randomUUID(), category: 'WRIST', severity: 'WARNING', title: 'Wrist slightly cupped', description: 'Left wrist showing slight cup at this position.', correction: 'Focus on keeping the left wrist flat or slightly bowed. Feel like the back of your left hand faces the sky.', proReference: 'Dustin Johnson' },
        ],
        'P4': [
            { id: crypto.randomUUID(), category: 'ROTATION', severity: 'INFO', title: 'Full shoulder turn', description: 'Excellent 95° shoulder turn creating good coil.', correction: 'This is a strength. Maintain this turn depth.', proReference: 'John Rahm' },
            { id: crypto.randomUUID(), category: 'BALANCE', severity: 'TIP', title: 'Weight slightly toward toes', description: 'Pressure has moved slightly toward the toes at the top.', correction: 'Feel the weight in the middle to heel of the trail foot at the top.', proReference: 'Tiger Woods' }
        ],
        'P5': [
            { id: crypto.randomUUID(), category: 'WEIGHT_SHIFT', severity: 'WARNING', title: 'Transition could be smoother', description: 'The transition from backswing to downswing shows a slight lurch.', correction: 'Feel the lower body start the downswing while the upper body is still completing the backswing. This creates the X-factor stretch.', proReference: 'Rory McIlroy' },
        ],
        'P6': [
            { id: crypto.randomUUID(), category: 'CLUB_FACE', severity: 'WARNING', title: 'Club face slightly open', description: 'The club face appears 5-8° open relative to the shaft plane.', correction: 'Focus on maintaining the left wrist bow from P5. The toe of the club should point slightly toward the ground here.', proReference: 'Collin Morikawa' },
            { id: crypto.randomUUID(), category: 'CLUB_PATH', severity: 'TIP', title: 'Shaft slightly steep', description: 'Club shaft is slightly above the ideal plane.', correction: 'Feel the right elbow dropping closer to the right hip to shallow the shaft.', proReference: 'Matt Wolff' }
        ],
        'P7': [
            { id: crypto.randomUUID(), category: 'ROTATION', severity: 'CRITICAL', title: 'Hips not open enough', description: 'Hips showing only 30° of opening at impact vs ideal 40-45°.', correction: 'Focus on the Wall Hip Bump drill. The lower body must lead the downswing and clear aggressively through impact.', proReference: 'Tiger Woods' },
            { id: crypto.randomUUID(), category: 'POSTURE', severity: 'WARNING', title: 'Early extension detected', description: 'Your pelvis has moved 2 inches closer to the ball compared to address.', correction: 'Maintain your tush line. Practice with your glutes against a chair and maintain contact through impact.', proReference: 'Adam Scott' }
        ],
        'P8': [
            { id: crypto.randomUUID(), category: 'ROTATION', severity: 'INFO', title: 'Good extension through the ball', description: 'Arms are extending well through the release.', correction: 'Continue focusing on full extension. Feel like you\'re throwing the club head at the target.', proReference: 'Ernie Els' },
        ],
        'P9': [
            { id: crypto.randomUUID(), category: 'BALANCE', severity: 'TIP', title: 'Body rotating well post-impact', description: 'Good continuation of rotation through the ball.', correction: 'Ensure the right shoulder continues to rotate under the chin.', proReference: 'Ben Hogan' },
        ],
        'P10': [
            { id: crypto.randomUUID(), category: 'BALANCE', severity: 'INFO', title: 'Balanced finish', description: 'You\'re holding a balanced finish which shows good tempo and control.', correction: 'Hold this finish for a full 3-count after every swing, even in practice.', proReference: 'Gary Player' },
        ]
    };

    return feedbackPool[positionId] || [];
}
