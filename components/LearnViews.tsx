import React, { useState } from 'react';
import { Course, CourseCategoryType, CourseLesson } from '../types';
import { COLORS, MOCK_LEARNING_PATHS } from '../constants';
import { Text, Card, Badge, ProgressBar, Button, Tabs } from './UIComponents';
import { db } from '../services/dataService';

const Icons = {
    Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    Lock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    ChevronLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    FileText: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    Grid: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    Activity: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
};

type ViewState = 'DASHBOARD' | 'COURSE_DETAIL' | 'LESSON_PLAYER';

export const LearnSystem: React.FC = () => {
    const [view, setView] = useState<ViewState>('DASHBOARD');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);

    const handleSelectCourse = (course: Course) => {
        setSelectedCourse(course);
        setView('COURSE_DETAIL');
    };

    const handleSelectLesson = (lesson: CourseLesson) => {
        if (lesson.locked) return;
        setSelectedLesson(lesson);
        setView('LESSON_PLAYER');
    };

    const handleBack = () => {
        if (view === 'LESSON_PLAYER') {
            setView('COURSE_DETAIL');
            // Ensure selectedCourse is fresh from DB to reflect progress
            if (selectedCourse) {
                const updatedCourse = db.getCourses().find(c => c.id === selectedCourse.id);
                if (updatedCourse) setSelectedCourse(updatedCourse);
            }
            setSelectedLesson(null);
        } else {
            setView('DASHBOARD');
            setSelectedCourse(null);
        }
    };

    if (view === 'DASHBOARD') return <LearnDashboard onSelectCourse={handleSelectCourse} />;
    if (view === 'COURSE_DETAIL' && selectedCourse) return <CourseDetail course={selectedCourse} onBack={handleBack} onSelectLesson={handleSelectLesson} />;
    if (view === 'LESSON_PLAYER' && selectedLesson && selectedCourse) return <LessonPlayer course={selectedCourse} lesson={selectedLesson} onBack={handleBack} />;

    return null;
};

const LearnDashboard: React.FC<{ onSelectCourse: (course: Course) => void }> = ({ onSelectCourse }) => {
    const [categoryFilter, setCategoryFilter] = useState<CourseCategoryType | 'ALL'>('ALL');
    
    // Use DB courses instead of Mock constant to ensure progress tracking works
    const courses = db.getCourses();

    const filteredCourses = categoryFilter === 'ALL' 
        ? courses 
        : courses.filter(c => c.category === categoryFilter);

    // Filter for Quant courses for specific section
    const quantCourses = courses.filter(c => c.category === 'QUANT_ANALYSIS');

    return (
        <div className="space-y-8 pb-32 animate-in fade-in duration-500">
            {/* Header */}
            <div className="px-1 pt-6">
                <Text variant="caption" className="uppercase font-bold tracking-widest text-orange-500 mb-1">Education</Text>
                <Text variant="h1" className="mb-2">The Conservatory</Text>
                <Text variant="body" color="gray">Master the art and science of the game through structured movements.</Text>
            </div>

            {/* Paths of Mastery */}
            <section>
                 <Text variant="h3" className="mb-4 px-1">Paths of Mastery</Text>
                 <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-1">
                    {MOCK_LEARNING_PATHS.map(path => (
                        <div key={path.id} className="min-w-[280px] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg shadow-gray-200/50 flex flex-col group cursor-pointer">
                            <div className="h-32 relative overflow-hidden">
                                <img src={path.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-3 left-3 text-white">
                                    <Text variant="h4" className="leading-none text-white">{path.title}</Text>
                                    <Text variant="caption" className="text-gray-300 text-[10px] uppercase font-bold mt-1">{path.totalCourses} Courses</Text>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <Text className="text-sm text-gray-500 line-clamp-2 mb-3">{path.description}</Text>
                                <Button size="sm" variant="outline" fullWidth onClick={() => {
                                    // In real app, navigate to path detail. Here we just open the first course of the path
                                    const firstCourse = courses.find(c => c.id === path.courseIds[0]);
                                    if(firstCourse) onSelectCourse(firstCourse);
                                }}>Start Path</Button>
                            </div>
                        </div>
                    ))}
                 </div>
            </section>

             {/* Quant Lab Section */}
             <section className="bg-gray-900 text-white p-6 -mx-6 mb-8">
                <div className="px-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-400">
                            <Icons.Activity />
                        </div>
                        <div>
                            <Text variant="h3" color="white">Quant Lab</Text>
                            <Text variant="caption" className="text-gray-400">Understanding the numbers</Text>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {quantCourses.map(course => (
                            <div key={course.id} onClick={() => onSelectCourse(course)} className="flex gap-4 bg-white/5 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors border border-white/10">
                                <div className="w-16 h-16 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                                    <img src={course.thumbnailUrl} className="w-full h-full object-cover opacity-80" />
                                </div>
                                <div>
                                    <Text variant="body" color="white" className="font-bold text-sm leading-tight mb-1">{course.title}</Text>
                                    <Text variant="caption" className="text-gray-400 text-xs">{course.instructor}</Text>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Course Directory */}
            <section>
                <div className="flex justify-between items-end mb-4 px-1">
                    <Text variant="h3">Course Directory</Text>
                </div>
                
                {/* Directory Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-2">
                    {['ALL', 'PUTTING', 'CHIPPING', 'SAND', 'PITCHING', 'IRON_PLAY', 'DRIVER'].map((cat) => (
                         <button 
                            key={cat} 
                            onClick={() => setCategoryFilter(cat as CourseCategoryType | 'ALL')}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${
                                categoryFilter === cat 
                                    ? 'bg-gray-900 text-white border-gray-900' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {cat.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filteredCourses.map((course) => (
                        <div key={course.id} onClick={() => onSelectCourse(course)} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-6 last:border-0">
                            <div className="w-24 h-32 rounded-lg bg-gray-200 overflow-hidden relative shadow-sm flex-shrink-0">
                                <img src={course.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                {course.progress === 100 && (
                                    <div className="absolute inset-0 bg-green-900/60 flex items-center justify-center">
                                        <div className="bg-white text-green-700 rounded-full p-1"><Icons.Check /></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <Text variant="caption" className="text-orange-600 font-bold uppercase tracking-wider text-[10px]">{course.tagline}</Text>
                                        {course.handicapImpact > 0 && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium">-{course.handicapImpact} HCP</span>}
                                    </div>
                                    <Text variant="h4" className="leading-tight mb-1">{course.title}</Text>
                                    <Text variant="caption" className="line-clamp-2 text-xs leading-relaxed">{course.description}</Text>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">
                                        <Icons.Clock /> {course.totalDuration}m
                                    </div>
                                    {course.progress > 0 && (
                                        <div className="flex-1 max-w-[80px]">
                                            <ProgressBar progress={course.progress} className="h-1" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

const CourseDetail: React.FC<{ course: Course; onBack: () => void; onSelectLesson: (l: CourseLesson) => void }> = ({ course, onBack, onSelectLesson }) => {
    return (
        <div className="bg-white min-h-screen pb-32 animate-in slide-in-from-right duration-300">
            {/* Hero */}
            <div className="relative h-72 bg-gray-900">
                <img src={course.thumbnailUrl} className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                {/* Nav */}
                <button onClick={onBack} className="absolute top-6 left-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-20 border border-white/10">
                    <Icons.ChevronLeft />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <Text variant="caption" className="text-orange-400 font-bold tracking-widest uppercase mb-2">{course.tagline}</Text>
                    <Text variant="h1" color="white" className="mb-2">{course.title}</Text>
                    <Text color="gray" className="text-gray-300 line-clamp-2 text-sm max-w-md">{course.description}</Text>
                    
                    <div className="flex items-center gap-4 mt-6">
                         <div className="flex-1">
                             <div className="flex justify-between text-xs font-bold text-gray-300 mb-2">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                            </div>
                            <ProgressBar progress={course.progress} color={COLORS.primary} className="bg-white/20 h-1" />
                         </div>
                         <Button size="sm" variant="primary" className="px-6">Resume</Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {course.modules.length === 0 && (
                    <div className="text-center py-12">
                        <Text color="gray">Movement content coming soon.</Text>
                    </div>
                )}
                
                <div className="space-y-8">
                    {course.modules.map((module) => (
                        <div key={module.id}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <Text variant="h4" className="text-gray-400 font-normal uppercase text-xs tracking-widest">{module.title}</Text>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>
                            
                            <div className="space-y-3">
                                {module.lessons.map((lesson) => (
                                    <div 
                                        key={lesson.id} 
                                        onClick={() => onSelectLesson(lesson)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                            lesson.locked 
                                                ? 'bg-gray-50 border-transparent opacity-60 cursor-not-allowed' 
                                                : 'bg-white border-gray-100 hover:border-orange-200 cursor-pointer shadow-sm hover:shadow-md'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            lesson.completed ? 'bg-green-100 text-green-600' : 
                                            lesson.locked ? 'bg-gray-200 text-gray-400' : 'bg-orange-50 text-orange-500'
                                        }`}>
                                            {lesson.completed ? <Icons.Check /> : lesson.locked ? <Icons.Lock /> : <Icons.Play />}
                                        </div>
                                        <div className="flex-1">
                                            <Text variant="body" className="font-bold text-sm mb-0.5">{lesson.title}</Text>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{lesson.durationMinutes} min</span>
                                                {lesson.targetMetrics && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-orange-600 font-medium">Data Focus</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LessonPlayer: React.FC<{ course: Course; lesson: CourseLesson; onBack: () => void }> = ({ course, lesson, onBack }) => {
    const [activeTab, setActiveTab] = useState('STUDIO');

    const handleComplete = () => {
        db.completeLesson(course.id, lesson.id);
        onBack();
    };

    return (
        <div className="bg-black min-h-screen text-white flex flex-col animate-in fade-in duration-300">
            {/* Video Player Placeholder */}
            <div className="w-full aspect-video bg-gray-900 relative group">
                <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white z-20 backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100">
                    <Icons.ChevronLeft />
                </button>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <div className="ml-1"><Icons.Play /></div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                    <div className="w-1/3 h-full bg-orange-500"></div>
                </div>
            </div>

            {/* Lesson Content */}
            <div className="flex-1 bg-white text-gray-900 rounded-t-3xl -mt-4 relative z-10 flex flex-col overflow-hidden">
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-2">
                        <Text variant="caption" className="text-orange-600 font-bold uppercase tracking-wider">{course.title}</Text>
                        {lesson.completed && <Badge variant="success">Completed</Badge>}
                    </div>
                    <Text variant="h3" className="mb-2 leading-tight">{lesson.title}</Text>
                    <Text variant="body" className="text-gray-500 text-sm">{lesson.description}</Text>
                </div>

                {/* Tabs */}
                <div className="px-6 mt-4">
                    <Tabs 
                        tabs={['STUDIO', 'NOTES', 'COMMUNITY']} 
                        activeTab={activeTab} 
                        onTabChange={setActiveTab} 
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {activeTab === 'STUDIO' && (
                        <div className="space-y-6">
                            {/* Target Metrics */}
                            {lesson.targetMetrics && lesson.targetMetrics.length > 0 && (
                                <div>
                                    <Text variant="h4" className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-widest">Target Metrics</Text>
                                    <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                                        {lesson.targetMetrics.map((metric, i) => (
                                            <div key={i} className="bg-white border border-gray-100 p-3 rounded-xl min-w-[100px] shadow-sm">
                                                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{metric.label}</div>
                                                <div className="text-xl font-black text-gray-900">{metric.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Key Takeaways */}
                            <div>
                                <Text variant="h4" className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-widest">Key Takeaways</Text>
                                <div className="space-y-2">
                                    {lesson.keyTakeaways.map((point, i) => (
                                        <div key={i} className="flex gap-3 items-start p-3 bg-white rounded-lg border border-gray-100">
                                            <div className="w-5 h-5 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-xs mt-0.5">{i+1}</div>
                                            <Text className="text-sm leading-relaxed">{point}</Text>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             {/* Resources */}
                             {lesson.resources && lesson.resources.length > 0 && (
                                <div>
                                    <Text variant="h4" className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-widest">Resources</Text>
                                    <div className="space-y-2">
                                        {lesson.resources.map((res) => (
                                            <div key={res.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:border-orange-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-gray-400"><Icons.FileText /></div>
                                                    <Text className="text-sm font-medium">{res.title}</Text>
                                                </div>
                                                <div className="text-orange-500 text-xs font-bold uppercase">Open</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 pb-20">
                                {!lesson.completed && (
                                    <Button fullWidth variant="primary" className="shadow-orange-200 shadow-lg" onClick={handleComplete}>
                                        Mark as Complete
                                    </Button>
                                )}
                                {lesson.completed && (
                                    <Button fullWidth variant="ghost" className="bg-green-50 text-green-600 border-green-100" onClick={onBack}>
                                        Lesson Completed
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'NOTES' && (
                        <div className="text-center py-12 text-gray-400">
                            <Text>Your personal notes for this lesson will appear here.</Text>
                        </div>
                    )}
                    {activeTab === 'COMMUNITY' && (
                         <div className="text-center py-12 text-gray-400">
                            <Text>Join the discussion with other members.</Text>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};