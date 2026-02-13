import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

// Game Store using Zustand for managing gamification state
const useGameStore = create(
    persist(
        (set, get) => ({
            // State
            points: 0,
            level: 1,
            experience: 0,
            streak: 0,
            achievements: [],
            styleArchetype: null,
            styleProfile: null,
            wishlist: [],
            spinsRemaining: 1,
            lastSpinDate: null,

            // Actions
            addPoints: (amount) => {
                set((state) => {
                    const newPoints = state.points + amount;
                    const newExperience = state.experience + amount;
                    const newLevel = Math.floor(newExperience / 1000) + 1;

                    return {
                        points: newPoints,
                        experience: newExperience,
                        level: newLevel
                    };
                });
            },

            removePoints: (amount) => {
                set((state) => ({
                    points: Math.max(0, state.points - amount)
                }));
            },

            setPoints: (points) => {
                set({ points });
            },

            addAchievement: (achievement) => {
                set((state) => {
                    if (!state.achievements.find(a => a.id === achievement.id)) {
                        return {
                            achievements: [...state.achievements, achievement]
                        };
                    }
                    return state;
                });
            },

            updateStreak: () => {
                const today = new Date().toDateString();
                const lastLogin = get().lastLoginDate;

                set((state) => {
                    if (!lastLogin) {
                        // First login
                        return {
                            streak: 1,
                            lastLoginDate: today
                        };
                    }

                    const lastDate = new Date(lastLogin);
                    const currentDate = new Date(today);
                    const diffTime = Math.abs(currentDate - lastDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        // Consecutive day
                        return {
                            streak: state.streak + 1,
                            lastLoginDate: today
                        };
                    } else if (diffDays > 1) {
                        // Streak broken
                        return {
                            streak: 1,
                            lastLoginDate: today
                        };
                    }

                    // Same day login
                    return state;
                });
            },

            addSpin: () => {
                set((state) => ({
                    spinsRemaining: (state.spinsRemaining || 0) + 1
                }));
            },

            useSpin: () => {
                set((state) => ({
                    spinsRemaining: Math.max(0, (state.spinsRemaining || 0) - 1),
                    lastSpinDate: new Date().toDateString()
                }));
            },

            checkDailySpin: () => {
                const today = new Date().toDateString();
                const lastSpin = get().lastSpinDate;

                if (lastSpin !== today) {
                    set((state) => ({
                        spinsRemaining: Math.max(state.spinsRemaining || 0, 1),
                        lastSpinDate: today
                    }));
                    return true;
                }
                // Also ensure it's at least 0 and not NaN
                if (typeof get().spinsRemaining !== 'number' || isNaN(get().spinsRemaining)) {
                    set({ spinsRemaining: 1 });
                }
                return false;
            },

            // Skills Progression
            skills: {
                colorMastery: 0,
                patternPath: 0,
                speedPath: 0,
                knowledgePath: 0
            },

            addSkillPoints: (skill, amount) => {
                set((state) => ({
                    skills: {
                        ...state.skills,
                        [skill]: Math.min(100, (state.skills[skill] || 0) + amount)
                    }
                }));
            },

            // Rewards & Games State
            bingoCard: {
                theme: 'Summer Essentials',
                squares: [
                    { id: 0, type: 'Dress', keywords: ['dress', 'maxi', 'mini', 'gown'], marked: false, details: null },
                    { id: 1, type: 'Shoes', keywords: ['shoe', 'heels', 'sneaker', 'boots'], marked: false, details: null },
                    { id: 2, type: 'Bag', keywords: ['bag', 'handbag', 'tote', 'clutch'], marked: false, details: null },
                    { id: 3, type: 'Hat', keywords: ['hat', 'cap', 'beanie', 'fedora'], marked: false, details: null },
                    { id: 4, type: 'Summer', keywords: ['summer', 'sun', 'hot'], marked: false, details: null },
                    { id: 5, type: 'Floral', keywords: ['floral', 'flower', 'print'], marked: false, details: null },
                    { id: 6, type: 'Jeans', keywords: ['jeans', 'denim', 'pants'], marked: false, details: null },
                    { id: 7, type: 'Top', keywords: ['top', 'shirt', 'blouse', 'tee'], marked: false, details: null },
                    { id: 8, type: 'Swim', keywords: ['swim', 'bikini', 'beach'], marked: false, details: null },
                    { id: 9, type: 'Beach', keywords: ['beach', 'sand', 'ocean'], marked: false, details: null },
                    { id: 10, type: 'Color', keywords: ['color', 'vibrant', 'bright'], marked: false, details: null },
                    { id: 11, type: 'Kimono', keywords: ['kimono', 'robe', 'wrap'], marked: false, details: null },
                    { id: 12, type: 'FREE', keywords: ['free'], marked: true, details: { action: 'system', time: new Date().toISOString() } },
                    { id: 13, type: 'Flip', keywords: ['flip', 'flop', 'sandal'], marked: false, details: null },
                    { id: 14, type: 'Tropical', keywords: ['tropical', 'palm', 'island'], marked: false, details: null },
                    { id: 15, type: 'Sunglasses', keywords: ['sunglasses', 'shades', 'eyewear'], marked: false, details: null },
                    { id: 16, type: 'Clutch', keywords: ['clutch', 'purse', 'pouch'], marked: false, details: null },
                    { id: 17, type: 'Sandals', keywords: ['sandals', 'sliders', 'wedges'], marked: false, details: null },
                    { id: 18, type: 'Cap', keywords: ['cap', 'hat', 'baseball'], marked: false, details: null },
                    { id: 19, type: 'Shell', keywords: ['shell', 'ocean', 'pearl'], marked: false, details: null },
                    { id: 20, type: 'Ocean', keywords: ['ocean', 'sea', 'blue'], marked: false, details: null },
                    { id: 21, type: 'Bikini', keywords: ['bikini', 'swimwear'], marked: false, details: null },
                    { id: 22, type: 'One-Piece', keywords: ['one-piece', 'monokini'], marked: false, details: null },
                    { id: 23, type: 'Target', keywords: ['target'], marked: false, details: null },
                    { id: 24, type: 'Bonus', keywords: ['bonus'], marked: false, details: null }
                ],
                completedPatterns: [],
                lastReset: new Date().toDateString(),
                history: [] // Daily history log
            },
            activeChallenge: {
                id: 'daily_style',
                status: 'idle', // idle, started, completed
                theme: 'Bohemian Beach Party',
                score: 0
            },
            discounts: [],

            // Game Actions
            // Updated markBingoSquare to handle action types and product mapping
            markBingoSquare: (triggerValue, actionType = 'view', product = null) => {
                set((state) => {
                    const card = state.bingoCard;
                    const today = new Date().toDateString();

                    // Auto-reset if new day
                    if (card.lastReset !== today) {
                        // Logic for reset could be handled here or in a separate effect
                    }

                    const sqIndex = card.squares.findIndex(sq => {
                        if (sq.marked) return false;
                        const term = triggerValue.toLowerCase();
                        const sqType = sq.type.toLowerCase();

                        // Action-based triggering: Check if triggerValue matches Square Type OR any keywords
                        const matchesType = term.includes(sqType) || sqType.includes(term);
                        const matchesKeywords = sq.keywords?.some(k => term.includes(k.toLowerCase()) || k.toLowerCase().includes(term));

                        return matchesType || matchesKeywords;
                    });

                    if (sqIndex === -1 || card.squares[sqIndex].marked) return state;

                    const newSquares = [...card.squares];
                    const timestamp = new Date().toISOString();

                    newSquares[sqIndex] = {
                        ...newSquares[sqIndex],
                        marked: true,
                        details: {
                            action: actionType,
                            productId: product?._id || product?.id || 'unknown',
                            productName: product?.name || 'Unknown Product',
                            time: timestamp
                        }
                    };

                    // Points calculation based on action type
                    let pointsToAdd = 5;
                    if (actionType === 'purchase') pointsToAdd = 100; // Big bonus for purchase
                    if (actionType === 'wishlist') pointsToAdd = 15;
                    if (actionType === 'try-on') pointsToAdd = 25;

                    // Special Squares Logic
                    if (newSquares[sqIndex].type === 'Target') {
                        pointsToAdd += (actionType === 'purchase' ? 200 : 50);
                    }

                    // Pattern Recognition logic
                    const patterns = [];
                    const isMarked = (idx) => newSquares[idx] && newSquares[idx].marked;
                    const alreadyWon = card.completedPatterns;

                    // Rows
                    for (let i = 0; i < 5; i++) {
                        const row = [i * 5, i * 5 + 1, i * 5 + 2, i * 5 + 3, i * 5 + 4];
                        const id = `Row ${i + 1}`;
                        if (row.every(isMarked) && !alreadyWon.includes(id)) {
                            patterns.push(id);
                            pointsToAdd += 100;
                            toast.success(`BINGO! Completed ${id} (+100 XP)`, { icon: '🎉' });
                        }
                    }

                    // Columns
                    for (let i = 0; i < 5; i++) {
                        const col = [i, i + 5, i + 10, i + 15, i + 20];
                        const id = `Column ${i + 1}`;
                        if (col.every(isMarked) && !alreadyWon.includes(id)) {
                            patterns.push(id);
                            pointsToAdd += 100;
                            toast.success(`BINGO! Completed ${id} (+100 XP)`, { icon: '🎊' });
                        }
                    }

                    // Diagonals
                    if ([0, 6, 12, 18, 24].every(isMarked) && !alreadyWon.includes('Diagonal Left')) {
                        patterns.push('Diagonal Left');
                        pointsToAdd += 150;
                        toast.success('BINGO! Diagonal Master (+150 XP)', { icon: '✨' });
                    }
                    if ([4, 8, 12, 16, 20].every(isMarked) && !alreadyWon.includes('Diagonal Right')) {
                        patterns.push('Diagonal Right');
                        pointsToAdd += 150;
                        toast.success('BINGO! Diagonal Master (+150 XP)', { icon: '✨' });
                    }

                    // Corners
                    if ([0, 4, 20, 24].every(isMarked) && !alreadyWon.includes('Four Corners')) {
                        patterns.push('Four Corners');
                        pointsToAdd += 200;
                        toast.success('BINGO! Four Corners (+200 XP)', { icon: '🏆' });
                    }

                    // Full House
                    if (newSquares.every(isMarked) && !alreadyWon.includes('Full House')) {
                        patterns.push('Full House');
                        pointsToAdd += 500;
                        toast.success('BINGO! FULL HOUSE CHAMPION! (+500 XP)', { icon: '👑' });
                    }

                    const currentExp = state.experience + pointsToAdd;
                    const currentLevel = Math.floor(currentExp / 1000) + 1;

                    let spins = state.spinsRemaining;
                    if (newSquares[sqIndex].type === 'Bonus') {
                        spins += 1;
                        toast.success('BONUS ROUND! Extra Spin awarded!', { icon: '🎡' });
                    }

                    return {
                        points: state.points + pointsToAdd,
                        experience: currentExp,
                        level: currentLevel,
                        spinsRemaining: spins,
                        bingoCard: {
                            ...card,
                            squares: newSquares,
                            completedPatterns: [...card.completedPatterns, ...patterns]
                        }
                    };
                });
            },

            completeChallenge: (score) => {
                set((state) => ({
                    activeChallenge: { ...state.activeChallenge, status: 'completed', score },
                    points: state.points + 200 + (score >= 80 ? 100 : 0)
                }));
            },

            addDiscount: (discount) => {
                set((state) => ({
                    discounts: [...state.discounts, { ...discount, id: Date.now() }]
                }));
            },

            toggleWishlist: (product) => {
                set((state) => {
                    const exists = state.wishlist.find(item => item._id === product._id);
                    if (exists) {
                        toast.success('Removed from Wishlist', { icon: '💔' });
                        return { wishlist: state.wishlist.filter(item => item._id !== product._id) };
                    } else {
                        toast.success('Added to Wishlist! (+15 XP)', { icon: '❤️' });
                        // Also trigger potential bingo/points logic here if needed
                        return { wishlist: [...state.wishlist, product] };
                    }
                });
            },

            completeStyleQuiz: (archetype, fullProfile) => {
                set((state) => {
                    const bonusPoints = 100;
                    const newExperience = state.experience + bonusPoints;
                    const newLevel = Math.floor(newExperience / 1000) + 1;

                    const achievement = {
                        id: 'style_discovered',
                        name: 'Style Discovered',
                        icon: '🎀',
                        date: new Date().toISOString()
                    };

                    const alreadyHasAchievement = state.achievements.find(a => a.id === 'style_discovered');

                    return {
                        styleArchetype: archetype,
                        styleProfile: fullProfile,
                        points: state.points + bonusPoints,
                        experience: newExperience,
                        level: newLevel,
                        achievements: alreadyHasAchievement ? state.achievements : [...state.achievements, achievement]
                    };
                });
                toast.success('Style Archetype Unlocked! +100 XP', { icon: '🎀' });
            },

            resetStore: () => {
                set({
                    points: 0,
                    level: 1,
                    experience: 0,
                    streak: 0,
                    spinsRemaining: 1,
                    lastSpinDate: null,
                    lastLoginDate: null,
                    achievements: [],
                    skills: {
                        colorMastery: 0,
                        patternPath: 0,
                        speedPath: 0,
                        knowledgePath: 0
                    },
                    bingoCard: {
                        theme: 'Summer Essentials',
                        squares: [
                            { id: 0, type: 'Dress', keywords: ['dress', 'maxi', 'mini', 'gown'], marked: false, details: null },
                            { id: 1, type: 'Shoes', keywords: ['shoe', 'heels', 'sneaker', 'boots'], marked: false, details: null },
                            { id: 2, type: 'Bag', keywords: ['bag', 'handbag', 'tote', 'clutch'], marked: false, details: null },
                            { id: 3, type: 'Hat', keywords: ['hat', 'cap', 'beanie', 'fedora'], marked: false, details: null },
                            { id: 4, type: 'Summer', keywords: ['summer', 'sun', 'hot'], marked: false, details: null },
                            { id: 5, type: 'Floral', keywords: ['floral', 'flower', 'print'], marked: false, details: null },
                            { id: 6, type: 'Jeans', keywords: ['jeans', 'denim', 'pants'], marked: false, details: null },
                            { id: 7, type: 'Top', keywords: ['top', 'shirt', 'blouse', 'tee'], marked: false, details: null },
                            { id: 8, type: 'Swim', keywords: ['swim', 'bikini', 'beach'], marked: false, details: null },
                            { id: 9, type: 'Beach', keywords: ['beach', 'sand', 'ocean'], marked: false, details: null },
                            { id: 10, type: 'FREE', keywords: ['free'], marked: true, details: { action: 'system', time: new Date().toISOString() } },
                            { id: 11, type: 'Color', keywords: ['color', 'vibrant', 'bright'], marked: false, details: null },
                            { id: 12, type: 'Kimono', keywords: ['kimono', 'robe', 'wrap'], marked: false, details: null },
                            { id: 13, type: 'Flip', keywords: ['flip', 'flop', 'sandal'], marked: false, details: null },
                            { id: 14, type: 'Tropical', keywords: ['tropical', 'palm', 'island'], marked: false, details: null },
                            { id: 15, type: 'Sunglasses', keywords: ['sunglasses', 'shades', 'eyewear'], marked: false, details: null },
                            { id: 16, type: 'Clutch', keywords: ['clutch', 'purse', 'pouch'], marked: false, details: null },
                            { id: 17, type: 'Sandals', keywords: ['sandals', 'sliders', 'wedges'], marked: false, details: null },
                            { id: 18, type: 'Cap', keywords: ['cap', 'hat', 'baseball'], marked: false, details: null },
                            { id: 19, type: 'Shell', keywords: ['shell', 'ocean', 'pearl'], marked: false, details: null },
                            { id: 20, type: 'Ocean', keywords: ['ocean', 'sea', 'blue'], marked: false, details: null },
                            { id: 21, type: 'Bikini', keywords: ['bikini', 'swimwear'], marked: false, details: null },
                            { id: 22, type: 'One-Piece', keywords: ['one-piece', 'monokini'], marked: false, details: null },
                            { id: 23, type: 'Target', keywords: ['target'], marked: false, details: null },
                            { id: 24, type: 'Bonus', keywords: ['bonus'], marked: false, details: null }
                        ],
                        completedPatterns: [],
                        lastReset: new Date().toDateString(),
                        history: []
                    },
                    activeChallenge: {
                        id: 'daily_style',
                        status: 'idle',
                        theme: 'Bohemian Beach Party',
                        score: 0
                    },
                    discounts: [],
                    styleArchetype: null,
                    styleProfile: null,
                    wishlist: []
                });
            }
        }),
        {
            name: 'game-storage', // Name for localStorage key
            getStorage: () => localStorage,
        }
    )
);

export { useGameStore };
