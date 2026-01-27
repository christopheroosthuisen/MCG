// ============================================================
// CATEGORY 8: LEARN SECTION IMPROVEMENTS
// ============================================================
// Copy each section into your project as needed.
//
// COMPONENTS INCLUDED:
// 1. EnhancedCourseCard - With estimated time & handicap impact
// 2. LearningPathCard - Course bundle display
// 3. LessonCard - With bookmark support
// 4. VideoPlayerControls - Enhanced video player
// 5. BookmarkButton - Toggle bookmark
// 6. RelatedDrills - Suggested drills after lesson
// 7. ModuleAccordion - Expandable module list
// 8. CourseProgress - Detailed progress display
// 9. HandicapImpactBadge - Projected improvement
// ============================================================

import React, { useState, useRef } from 'react';
import { Text, Button, Card, Badge, ProgressBar } from './UIComponents';
import { COLORS } from '../constants';
import { Course, CourseModule, CourseLesson, Drill } from '../types';

// ============================================================
// 1. ENHANCED COURSE CARD
// ============================================================

interface EnhancedCourseCardProps {
    course: Course;
    onClick: () => void;
    variant?: 'default' | 'compact' | 'featured';
}

export const EnhancedCourseCard: React.FC<EnhancedCourseCardProps> = ({
    course,
    onClick,
    variant = 'default'
}) => {
    const remainingTime = Math.round((100 - course.progress) / 100 * course.totalDuration);
    const isStarted = course.progress > 0;

    if (variant === 'compact') {
        return (
            <button
                onClick={onClick}
                className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all w-full text-left"
            >
                <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <Text variant="caption" className="text-orange-500 text-[10px] font-bold">
                        {course.tagline}
                    </Text>
                    <Text variant="h4" className="truncate">{course.title}</Text>
                    <div className="flex items-center gap-2 mt-1">
                        <ProgressBar progress={course.progress} className="flex-1 h-1"/>
                        <Text variant="caption" className="text-[10px]">{course.progress}%</Text>
                    </div>
                </div>
            </button>
        );
    }

    if (variant === 'featured') {
        return (
            <button
                onClick={onClick}
                className="relative w-full h-48 rounded-3xl overflow-hidden group"
            >
                <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"/>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                    <Badge variant="warning" className="bg-orange-500 mb-2">
                        {course.tagline}
                    </Badge>
                    <Text variant="h2" color="white">{course.title}</Text>
                    <Text variant="caption" className="text-white/70">{course.subtitle}</Text>

                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-white/80">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span className="text-xs">{course.totalDuration}m</span>
                        </div>
                        <HandicapImpactBadge impact={course.handicapImpact} />
                    </div>
                </div>

                {/* Progress overlay */}
                {isStarted && (
                    <div className="absolute top-4 right-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{course.progress}%</span>
                        </div>
                    </div>
                )}
            </button>
        );
    }

    // Default variant
    return (
        <Card variant="elevated" onClick={onClick} className="overflow-hidden group cursor-pointer">
            {/* Thumbnail */}
            <div className="relative h-36 -mx-5 -mt-5 mb-4 overflow-hidden">
                <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>

                {/* Tagline */}
                <div className="absolute bottom-3 left-3">
                    <Badge variant="warning" className="bg-orange-500">
                        {course.tagline}
                    </Badge>
                </div>

                {/* Duration */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span className="text-[10px] text-white font-medium">
                        {isStarted ? `${remainingTime}m left` : `${course.totalDuration}m`}
                    </span>
                </div>
            </div>

            {/* Content */}
            <Text variant="h3" className="mb-1">{course.title}</Text>
            <Text variant="caption" className="line-clamp-2 mb-4">{course.description}</Text>

            {/* Progress & Impact */}
            <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                    <ProgressBar progress={course.progress} />
                    <Text variant="caption" className="text-[10px] mt-1">
                        {course.progress}% complete
                    </Text>
                </div>
                <HandicapImpactBadge impact={course.handicapImpact} />
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                    👤
                </div>
                <Text variant="caption">{course.instructor}</Text>
            </div>
        </Card>
    );
};

// ============================================================
// 2. HANDICAP IMPACT BADGE
// ============================================================

export const HandicapImpactBadge: React.FC<{
    impact: number;
    showProjected?: boolean;
    currentHandicap?: number;
}> = ({ impact, showProjected = false, currentHandicap }) => {
    return (
        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14l5-5 5 5H7z"/>
            </svg>
            <span className="text-xs font-bold">
                {showProjected && currentHandicap
                    ? `${(currentHandicap - impact).toFixed(1)} projected`
                    : `-${impact} HCP`
                }
            </span>
        </div>
    );
};

// ============================================================
// 3. LEARNING PATH CARD
// ============================================================

interface LearningPath {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    courseIds: string[];
    totalCourses: number;
    completedCourses?: number;
}

export const LearningPathCard: React.FC<{
    path: LearningPath;
    onClick: () => void;
}> = ({ path, onClick }) => {
    const progress = path.completedCourses
        ? (path.completedCourses / path.totalCourses) * 100
        : 0;

    return (
        <button
            onClick={onClick}
            className="relative w-64 h-36 rounded-2xl overflow-hidden flex-shrink-0 group"
        >
            <img
                src={path.thumbnailUrl}
                alt={path.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"/>

            <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <Text variant="h4" color="white" className="mb-1">{path.title}</Text>
                <Text variant="caption" className="text-white/70 text-xs line-clamp-1">
                    {path.totalCourses} courses
                </Text>

                {progress > 0 && (
                    <div className="mt-2">
                        <ProgressBar progress={progress} color="white" className="h-1 bg-white/30"/>
                    </div>
                )}
            </div>
        </button>
    );
};

// ============================================================
// 4. LESSON CARD WITH BOOKMARK
// ============================================================

interface LessonCardProps {
    lesson: CourseLesson;
    index: number;
    isBookmarked?: boolean;
    onToggleBookmark?: () => void;
    onClick: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
    lesson,
    index,
    isBookmarked = false,
    onToggleBookmark,
    onClick
}) => {
    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                lesson.locked
                    ? 'bg-gray-50 opacity-60'
                    : lesson.completed
                        ? 'bg-green-50 hover:bg-green-100'
                        : 'bg-white hover:bg-gray-50 shadow-sm'
            }`}
        >
            {/* Lesson number / status */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                lesson.completed
                    ? 'bg-green-500 text-white'
                    : lesson.locked
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-orange-100 text-orange-600'
            }`}>
                {lesson.completed ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                ) : lesson.locked ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                ) : (
                    <span className="font-bold">{index + 1}</span>
                )}
            </div>

            {/* Content */}
            <button
                onClick={lesson.locked ? undefined : onClick}
                disabled={lesson.locked}
                className="flex-1 text-left min-w-0"
            >
                <Text variant="h4" className={`truncate ${lesson.locked ? 'text-gray-400' : ''}`}>
                    {lesson.title}
                </Text>
                <div className="flex items-center gap-3 mt-1">
                    <Text variant="caption" className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {lesson.durationMinutes}m
                    </Text>
                    {lesson.targetMetrics && lesson.targetMetrics.length > 0 && (
                        <Text variant="caption" className="text-orange-500">
                            {lesson.targetMetrics.length} target{lesson.targetMetrics.length > 1 ? 's' : ''}
                        </Text>
                    )}
                </div>
            </button>

            {/* Bookmark button */}
            {onToggleBookmark && !lesson.locked && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark();
                    }}
                    className={`p-2 rounded-full transition-colors ${
                        isBookmarked
                            ? 'text-orange-500 bg-orange-50'
                            : 'text-gray-300 hover:text-gray-500'
                    }`}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={isBookmarked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                </button>
            )}
        </div>
    );
};

// ============================================================
// 5. MODULE ACCORDION
// ============================================================

interface ModuleAccordionProps {
    module: CourseModule;
    moduleIndex: number;
    expandedByDefault?: boolean;
    bookmarkedLessons?: string[];
    onToggleBookmark?: (lessonId: string) => void;
    onLessonClick: (lessonId: string) => void;
}

export const ModuleAccordion: React.FC<ModuleAccordionProps> = ({
    module,
    moduleIndex,
    expandedByDefault = false,
    bookmarkedLessons = [],
    onToggleBookmark,
    onLessonClick
}) => {
    const [isExpanded, setIsExpanded] = useState(expandedByDefault);

    const completedLessons = module.lessons.filter(l => l.completed).length;
    const totalLessons = module.lessons.length;
    const progress = (completedLessons / totalLessons) * 100;

    return (
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        progress === 100
                            ? 'bg-green-500 text-white'
                            : 'bg-orange-100 text-orange-600'
                    }`}>
                        {progress === 100 ? '✓' : moduleIndex + 1}
                    </div>
                    <div className="text-left">
                        <Text variant="h4">{module.title}</Text>
                        <Text variant="caption">{completedLessons}/{totalLessons} lessons</Text>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-20 hidden sm:block">
                        <ProgressBar progress={progress} className="h-1"/>
                    </div>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
            </button>

            {/* Lessons */}
            {isExpanded && (
                <div className="p-3 space-y-2 bg-white">
                    {module.lessons.map((lesson, idx) => (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            index={idx}
                            isBookmarked={bookmarkedLessons.includes(lesson.id)}
                            onToggleBookmark={onToggleBookmark ? () => onToggleBookmark(lesson.id) : undefined}
                            onClick={() => onLessonClick(lesson.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================
// 6. RELATED DRILLS SECTION
// ============================================================

interface RelatedDrillsProps {
    drills: Drill[];
    onDrillClick: (drillId: string) => void;
}

export const RelatedDrills: React.FC<RelatedDrillsProps> = ({
    drills,
    onDrillClick
}) => {
    if (drills.length === 0) return null;

    return (
        <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎯</span>
                <Text variant="h4">Practice This Concept</Text>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {drills.map(drill => (
                    <button
                        key={drill.id}
                        onClick={() => onDrillClick(drill.id)}
                        className="flex-shrink-0 w-40 bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <img
                            src={drill.thumbnailUrl}
                            alt={drill.title}
                            className="w-full h-20 object-cover"
                        />
                        <div className="p-3">
                            <Text variant="caption" className="font-bold truncate">{drill.title}</Text>
                            <Text variant="caption" className="text-[10px] text-gray-400">
                                {drill.durationMinutes}m • {drill.difficulty}
                            </Text>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// 7. VIDEO PLAYER BOOKMARK CONTROLS
// ============================================================

interface VideoBookmark {
    id: string;
    timestamp: number;
    label?: string;
}

interface VideoBookmarkControlsProps {
    currentTime: number;
    bookmarks: VideoBookmark[];
    onAddBookmark: () => void;
    onSeekToBookmark: (timestamp: number) => void;
    onRemoveBookmark: (id: string) => void;
}

export const VideoBookmarkControls: React.FC<VideoBookmarkControlsProps> = ({
    currentTime,
    bookmarks,
    onAddBookmark,
    onSeekToBookmark,
    onRemoveBookmark
}) => {
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-900 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
                <Text variant="caption" className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    Bookmarks
                </Text>
                <button
                    onClick={onAddBookmark}
                    className="flex items-center gap-1 text-orange-500 text-xs font-medium hover:text-orange-400"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add at {formatTime(currentTime)}
                </button>
            </div>

            {bookmarks.length === 0 ? (
                <Text variant="caption" className="text-gray-500 text-center py-4">
                    No bookmarks yet. Add one to save important moments.
                </Text>
            ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    {bookmarks.map((bookmark, idx) => (
                        <div
                            key={bookmark.id}
                            className="flex items-center justify-between bg-gray-800 rounded-lg p-2 group"
                        >
                            <button
                                onClick={() => onSeekToBookmark(bookmark.timestamp)}
                                className="flex items-center gap-2 text-white hover:text-orange-500"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                                </svg>
                                <span className="font-mono text-sm">{formatTime(bookmark.timestamp)}</span>
                                {bookmark.label && (
                                    <span className="text-xs text-gray-400">- {bookmark.label}</span>
                                )}
                            </button>
                            <button
                                onClick={() => onRemoveBookmark(bookmark.id)}
                                className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================
// 8. KEY TAKEAWAYS SECTION
// ============================================================

interface KeyTakeawaysProps {
    takeaways: string[];
    targetMetrics?: Array<{ label: string; value: string }>;
}

export const KeyTakeaways: React.FC<KeyTakeawaysProps> = ({
    takeaways,
    targetMetrics = []
}) => {
    return (
        <div className="space-y-4">
            {/* Takeaways */}
            {takeaways.length > 0 && (
                <Card variant="filled" className="bg-blue-50 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">💡</span>
                        <Text variant="h4">Key Takeaways</Text>
                    </div>
                    <ul className="space-y-2">
                        {takeaways.map((takeaway, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6" className="flex-shrink-0 mt-0.5">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                                <Text variant="body" className="text-sm">{takeaway}</Text>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Target Metrics */}
            {targetMetrics.length > 0 && (
                <Card variant="filled" className="bg-green-50 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🎯</span>
                        <Text variant="h4">Target Metrics</Text>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {targetMetrics.map((metric, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-3 text-center">
                                <Text variant="metric" className="text-lg text-green-600">{metric.value}</Text>
                                <Text variant="caption" className="text-[10px]">{metric.label}</Text>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

// ============================================================
// USAGE EXAMPLES
// ============================================================
/*

// Example 1: Course Grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {courses.map(course => (
        <EnhancedCourseCard
            key={course.id}
            course={course}
            onClick={() => openCourse(course.id)}
        />
    ))}
</div>

// Example 2: Featured Course
<EnhancedCourseCard
    course={featuredCourse}
    onClick={() => openCourse(featuredCourse.id)}
    variant="featured"
/>

// Example 3: Learning Paths carousel
<div className="flex gap-4 overflow-x-auto pb-4">
    {learningPaths.map(path => (
        <LearningPathCard
            key={path.id}
            path={path}
            onClick={() => openPath(path.id)}
        />
    ))}
</div>

// Example 4: Course detail with modules
const [bookmarkedLessons, setBookmarkedLessons] = useState<string[]>([]);

const toggleBookmark = (lessonId: string) => {
    setBookmarkedLessons(prev =>
        prev.includes(lessonId)
            ? prev.filter(id => id !== lessonId)
            : [...prev, lessonId]
    );
};

{course.modules.map((module, idx) => (
    <ModuleAccordion
        key={module.id}
        module={module}
        moduleIndex={idx}
        expandedByDefault={idx === 0}
        bookmarkedLessons={bookmarkedLessons}
        onToggleBookmark={toggleBookmark}
        onLessonClick={(lessonId) => openLesson(lessonId)}
    />
))}

// Example 5: After lesson content
<RelatedDrills
    drills={relatedDrills}
    onDrillClick={(id) => openDrill(id)}
/>

<KeyTakeaways
    takeaways={lesson.keyTakeaways}
    targetMetrics={lesson.targetMetrics}
/>

*/
