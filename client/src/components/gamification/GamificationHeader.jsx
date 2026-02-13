import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import Confetti from 'react-confetti';
import {
    Zap, Flame, Star, Volume2, VolumeX,
    ChevronRight, Sparkles, Award, Target, Crown
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useAuth } from '../../context/AuthContext';
import soundEffects from '../../utils/soundEffects';

// Level configuration
const LEVELS = [
    { level: 1, name: 'Newcomer', minXP: 0, maxXP: 1000, color: 'from-gray-400 to-gray-500' },
    { level: 2, name: 'Trend Setter', minXP: 1000, maxXP: 2500, color: 'from-emerald-400 to-teal-500' },
    { level: 3, name: 'Style Maven', minXP: 2500, maxXP: 5000, color: 'from-blue-400 to-indigo-500' },
    { level: 4, name: 'Fashion Icon', minXP: 5000, maxXP: 10000, color: 'from-purple-400 to-pink-500' },
    { level: 5, name: 'Fashion Legend', minXP: 10000, maxXP: Infinity, color: 'from-amber-400 to-orange-500' },
];

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'first_task', name: 'First Steps', icon: '🎯', description: 'Complete your first task', condition: (stats) => stats.tasksCompleted >= 1 },
    { id: 'week_warrior', name: 'Week Warrior', icon: '🔥', description: '7-day login streak', condition: (stats) => stats.streak >= 7 },
    { id: 'point_master', name: 'Point Master', icon: '⚡', description: 'Earn 1000 points', condition: (stats) => stats.totalPointsEarned >= 1000 },
    { id: 'level_up', name: 'Level Up!', icon: '⭐', description: 'Reach Level 2', condition: (stats) => stats.level >= 2 },
    { id: 'dedicated', name: 'Dedicated', icon: '💎', description: '30-day streak', condition: (stats) => stats.streak >= 30 },
    { id: 'fashion_expert', name: 'Fashion Expert', icon: '👑', description: 'Reach Level 5', condition: (stats) => stats.level >= 5 },
];

// Animated counter component
const AnimatedCounter = ({ value, className = '' }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const prevValue = useRef(value);

    useEffect(() => {
        if (value !== prevValue.current) {
            const diff = value - prevValue.current;
            const steps = Math.min(Math.abs(diff), 20);
            const increment = diff / steps;
            let current = prevValue.current;
            let step = 0;

            const interval = setInterval(() => {
                step++;
                current += increment;
                setDisplayValue(Math.round(current));
                if (step >= steps) {
                    clearInterval(interval);
                    setDisplayValue(value);
                }
            }, 30);

            prevValue.current = value;
            return () => clearInterval(interval);
        }
    }, [value]);

    return <span className={className}>{displayValue.toLocaleString()}</span>;
};

// Floating points animation
const FloatingPoints = ({ points, onComplete }) => {
    return (
        <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -50, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            onAnimationComplete={onComplete}
            className="absolute -top-2 left-1/2 -translate-x-1/2 text-emerald-500 font-bold text-lg pointer-events-none z-50"
        >
            +{points}
        </motion.div>
    );
};

// XP Progress Bar with animation
const XPProgressBar = ({ currentXP, maxXP, levelName, nextLevelName }) => {
    const percentage = Math.min((currentXP / maxXP) * 100, 100);
    const springPercentage = useSpring(percentage, { stiffness: 100, damping: 20 });
    const width = useTransform(springPercentage, (v) => `${v}%`);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    <motion.div
                        className="h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                        style={{ width }}
                    />
                </div>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full"
                    style={{ width }}
                >
                    {/* Shimmer effect */}
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                </motion.div>
            </div>
            <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500 font-medium">
                    {currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP
                </span>
                <span className="text-xs text-gray-500">
                    {Math.round(maxXP - currentXP).toLocaleString()} XP to <strong className="text-teal-600">{nextLevelName}</strong>
                </span>
            </div>
        </div>
    );
};

// Achievement Badge Component
const AchievementBadge = ({ achievement, unlocked, isNew }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl cursor-pointer transition-all
                ${unlocked
                    ? 'bg-gradient-to-br from-amber-100 to-orange-100 shadow-md border-2 border-amber-300'
                    : 'bg-gray-100 border-2 border-gray-200 opacity-50 grayscale'
                }`}
            title={`${achievement.name}${unlocked ? ' ✓' : ' (Locked)'}`}
        >
            <span className={unlocked ? '' : 'opacity-50'}>{achievement.icon}</span>
            {isNew && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                >
                    <span className="text-white text-[10px] font-bold">!</span>
                </motion.div>
            )}
        </motion.div>
    );
};

// Level Up Celebration Modal
const LevelUpCelebration = ({ level, levelName, onClose }) => {
    useEffect(() => {
        soundEffects.playLevelUpSound();
        soundEffects.vibrateStrong();
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <Confetti numberOfPieces={300} recycle={false} colors={['#10B981', '#14B8A6', '#F59E0B', '#8B5CF6']} />
            <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                    className="text-6xl mb-4"
                >
                    🎉
                </motion.div>
                <h2 className="text-3xl font-black text-gray-800 mb-2">LEVEL UP!</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Crown className="text-amber-500" size={32} />
                    <span className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        {level}
                    </span>
                </div>
                <p className="text-xl font-bold text-gray-600 mb-6">
                    You are now a <span className="text-teal-600">{levelName}</span>!
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg"
                >
                    Awesome! 🚀
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

// Achievement Unlock Toast
const AchievementToast = ({ achievement, onClose }) => {
    useEffect(() => {
        soundEffects.playAchievementSound();
        soundEffects.vibrateMedium();
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-24 right-4 z-50 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 shadow-xl border border-amber-200 max-w-xs"
        >
            <div className="flex items-center gap-3">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                    className="text-4xl"
                >
                    {achievement.icon}
                </motion.div>
                <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Achievement Unlocked!</p>
                    <p className="font-bold text-gray-800">{achievement.name}</p>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                </div>
            </div>
        </motion.div>
    );
};

// Main GamificationHeader Component
const GamificationHeader = () => {
    const authContext = useAuth();
    const user = authContext?.user ?? null;
    const gameStore = useGameStore();

    // Safely extract values with defaults
    const points = gameStore?.points ?? 0;
    const experience = gameStore?.experience ?? 0;
    const level = gameStore?.level ?? 1;
    const streak = gameStore?.streak ?? 0;
    const unlockedAchievements = gameStore?.achievements ?? [];
    const addPoints = gameStore?.addPoints ?? (() => { });
    const updateStreak = gameStore?.updateStreak ?? (() => { });
    const addAchievement = gameStore?.addAchievement ?? (() => { });

    const [isMuted, setIsMuted] = useState(soundEffects.getMuted());
    const [floatingPoints, setFloatingPoints] = useState([]);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevelData, setNewLevelData] = useState(null);
    const [achievementToast, setAchievementToast] = useState(null);
    const [tasksCompleted, setTasksCompleted] = useState(() => {
        try {
            return parseInt(localStorage.getItem('tasksCompleted') || '0', 10);
        } catch {
            return 0;
        }
    });
    const [totalPointsEarned, setTotalPointsEarned] = useState(() => {
        try {
            return parseInt(localStorage.getItem('totalPointsEarned') || '0', 10);
        } catch {
            return 0;
        }
    });

    const prevLevel = useRef(level);
    const prevStreak = useRef(streak);

    // Get current level info (with safe fallback)
    const currentLevelInfo = LEVELS.find(l => l.level === level) || LEVELS[0];
    const nextLevelInfo = LEVELS.find(l => l.level === level + 1) || LEVELS[LEVELS.length - 1];
    const xpInCurrentLevel = Math.max(0, experience - currentLevelInfo.minXP);
    const xpNeededForNextLevel = nextLevelInfo.minXP === Infinity
        ? 10000
        : Math.max(1, nextLevelInfo.minXP - currentLevelInfo.minXP);

    // Initialize streak on mount
    useEffect(() => {
        if (typeof updateStreak === 'function') {
            updateStreak();
        }
    }, [updateStreak]);

    // Detect level up
    useEffect(() => {
        if (level > prevLevel.current) {
            setNewLevelData({ level, levelName: currentLevelInfo.name });
            setShowLevelUp(true);
            prevLevel.current = level;
        }
    }, [level, currentLevelInfo.name]);

    // Check for new achievements
    const checkAchievements = useCallback(() => {
        const stats = {
            tasksCompleted,
            streak,
            totalPointsEarned,
            level,
            points
        };

        ACHIEVEMENTS.forEach(achievement => {
            const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
            if (!isUnlocked && achievement.condition(stats)) {
                addAchievement({
                    id: achievement.id,
                    name: achievement.name,
                    icon: achievement.icon,
                    date: new Date().toISOString()
                });
                setAchievementToast(achievement);
            }
        });
    }, [tasksCompleted, streak, totalPointsEarned, level, points, unlockedAchievements, addAchievement]);

    useEffect(() => {
        checkAchievements();
    }, [checkAchievements]);

    // Handle streak animation
    useEffect(() => {
        if (streak > prevStreak.current && prevStreak.current > 0) {
            soundEffects.playStreakSound();
        }
        prevStreak.current = streak;
    }, [streak]);

    // Complete task handler
    const handleCompleteTask = useCallback(() => {
        const pointsToAdd = Math.floor(Math.random() * 30) + 20; // 20-50 points
        const xpToAdd = Math.floor(Math.random() * 50) + 50; // 50-100 XP

        soundEffects.playClickSound();
        soundEffects.vibrateLight();

        // Add floating animation
        const id = Date.now();
        setFloatingPoints(prev => [...prev, { id, points: pointsToAdd }]);

        // Update store
        addPoints(xpToAdd);

        // Update local stats
        const newTasksCompleted = tasksCompleted + 1;
        const newTotalPoints = totalPointsEarned + pointsToAdd;
        setTasksCompleted(newTasksCompleted);
        setTotalPointsEarned(newTotalPoints);

        try {
            localStorage.setItem('tasksCompleted', newTasksCompleted.toString());
            localStorage.setItem('totalPointsEarned', newTotalPoints.toString());
        } catch {
            // localStorage not available
        }

        // Play points sound
        setTimeout(() => {
            soundEffects.playPointsSound();
        }, 100);
    }, [addPoints, tasksCompleted, totalPointsEarned]);

    // Toggle mute
    const handleToggleMute = () => {
        const newMuted = soundEffects.toggleMute();
        setIsMuted(newMuted);
        if (!newMuted) {
            soundEffects.playClickSound();
        }
    };

    // Remove floating points
    const removeFloatingPoint = (id) => {
        setFloatingPoints(prev => prev.filter(p => p.id !== id));
    };

    return (
        <>
            {/* Level Up Celebration */}
            <AnimatePresence>
                {showLevelUp && newLevelData && (
                    <LevelUpCelebration
                        level={newLevelData.level}
                        levelName={newLevelData.levelName}
                        onClose={() => setShowLevelUp(false)}
                    />
                )}
            </AnimatePresence>

            {/* Achievement Toast */}
            <AnimatePresence>
                {achievementToast && (
                    <AchievementToast
                        achievement={achievementToast}
                        onClose={() => setAchievementToast(null)}
                    />
                )}
            </AnimatePresence>

            {/* Main Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-6 shadow-xl border border-orange-100/50 relative overflow-hidden"
            >
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

                {/* Sound toggle */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleMute}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 shadow-sm hover:bg-white transition-colors z-10"
                    title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                >
                    {isMuted ? (
                        <VolumeX size={18} className="text-gray-400" />
                    ) : (
                        <Volume2 size={18} className="text-teal-500" />
                    )}
                </motion.button>

                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between relative z-10">
                    {/* User Profile Section */}
                    <div className="flex items-center gap-5 w-full lg:w-auto">
                        {/* Avatar with Level Badge */}
                        <div className="relative flex-shrink-0">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-tr ${currentLevelInfo.color} shadow-lg`}
                            >
                                <img
                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Player'}`}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full bg-white object-cover"
                                />
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r ${currentLevelInfo.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border-2 border-white whitespace-nowrap`}
                            >
                                Level {level}
                            </motion.div>
                        </div>

                        {/* User Info & XP */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 truncate">
                                Welcome back, <span className="text-teal-600">{user?.username || 'Player1'}</span>!
                            </h2>
                            <XPProgressBar
                                currentXP={xpInCurrentLevel}
                                maxXP={xpNeededForNextLevel}
                                levelName={currentLevelInfo.name}
                                nextLevelName={nextLevelInfo.name}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
                        {/* Points Card */}
                        <motion.div
                            whileHover={{ y: -3, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                            className="relative bg-white p-4 rounded-2xl shadow-md border border-gray-100 text-center min-w-[100px]"
                        >
                            <AnimatePresence>
                                {floatingPoints.map(fp => (
                                    <FloatingPoints
                                        key={fp.id}
                                        points={fp.points}
                                        onComplete={() => removeFloatingPoint(fp.id)}
                                    />
                                ))}
                            </AnimatePresence>
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <Zap className="mx-auto text-yellow-500 mb-2" size={24} />
                            </motion.div>
                            <div className="text-xl md:text-2xl font-black text-gray-800">
                                <AnimatedCounter value={points} />
                            </div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Points</div>
                        </motion.div>

                        {/* Streak Card */}
                        <motion.div
                            whileHover={{ y: -3, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                            className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 text-center min-w-[100px]"
                        >
                            <motion.div
                                animate={{
                                    scale: streak >= 7 ? [1, 1.2, 1] : 1,
                                    rotate: streak >= 7 ? [0, 5, -5, 0] : 0
                                }}
                                transition={{ duration: 0.5, repeat: streak >= 7 ? Infinity : 0, repeatDelay: 2 }}
                            >
                                <Flame
                                    className={`mx-auto mb-2 ${streak >= 7 ? 'text-orange-500' : streak >= 3 ? 'text-orange-400' : 'text-gray-400'}`}
                                    size={24}
                                    fill={streak >= 3 ? 'currentColor' : 'none'}
                                />
                            </motion.div>
                            <div className="text-xl md:text-2xl font-black text-gray-800 flex items-center justify-center gap-1">
                                <AnimatedCounter value={streak} />
                                <span className="text-sm font-normal text-gray-500">Days</span>
                            </div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Streak</div>
                            {streak >= 7 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-[10px] text-orange-500 font-bold mt-1"
                                >
                                    🔥 On Fire!
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Achievements Card */}
                        <motion.div
                            whileHover={{ y: -3, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                            className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 text-center col-span-2"
                        >
                            <div className="flex justify-center -space-x-2 mb-2 overflow-x-auto pb-1">
                                {ACHIEVEMENTS.slice(0, 4).map((achievement) => {
                                    const unlocked = unlockedAchievements.some(a => a.id === achievement.id);
                                    return (
                                        <AchievementBadge
                                            key={achievement.id}
                                            achievement={achievement}
                                            unlocked={unlocked}
                                            isNew={false}
                                        />
                                    );
                                })}
                                {ACHIEVEMENTS.length > 4 && (
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 cursor-pointer"
                                    >
                                        +{ACHIEVEMENTS.length - 4}
                                    </motion.div>
                                )}
                            </div>
                            <div className="text-xs text-gray-800 font-bold">
                                Recent Achievements
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                                {unlockedAchievements.length} / {ACHIEVEMENTS.length} Unlocked
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Complete Task Button */}
                <div className="mt-6 flex justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(20, 184, 166, 0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCompleteTask}
                        className="relative group bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 overflow-hidden"
                    >
                        {/* Shimmer effect */}
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                        <Target size={20} className="relative z-10" />
                        <span className="relative z-10">Complete Task</span>
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <ChevronRight size={20} className="relative z-10" />
                        </motion.div>
                    </motion.button>
                </div>

                {/* Quick stats footer */}
                <div className="mt-4 flex justify-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400" />
                        <span>Tasks: <strong>{tasksCompleted}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Award size={14} className="text-purple-400" />
                        <span>Total XP: <strong>{experience.toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Sparkles size={14} className="text-teal-400" />
                        <span>Rank: <strong>{currentLevelInfo.name}</strong></span>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default GamificationHeader;
