const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const GameProfile = require('../models/mongo/GameProfile');

// Predefined prizes with weights
const PRIZES = [
    { label: '5% OFF', value: '5OFF', weight: 20 },
    { label: '50 XP', value: 50, weight: 25 },
    { label: 'Free Shipping', value: 'SHIP', weight: 15 },
    { label: 'Try Again', value: 0, weight: 10 },
    { label: '10% OFF', value: '10OFF', weight: 10 },
    { label: '100 XP', value: 100, weight: 10 },
    { label: '5% OFF', value: '5OFF_EXTRA', weight: 5 },
    { label: 'Try Again', value: 0, weight: 5 }
];

const getRandomPrize = () => {
    const totalWeight = PRIZES.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    for (const prize of PRIZES) {
        if (random < prize.weight) return prize;
        random -= prize.weight;
    }
    return PRIZES[0];
};

// GET spin status
router.get('/status', auth, async (req, res) => {
    try {
        let profile = await GameProfile.findOne({ userId: req.user.id });
        if (!profile) {
            profile = await GameProfile.create({ userId: req.user.id });
        }

        const now = new Date();
        const nextAvailable = profile.spinState?.nextSpinAvailableAt;
        const canSpin = !nextAvailable || now >= new Date(nextAvailable);

        res.json({
            canSpin,
            nextSpinAvailableAt: nextAvailable,
            lastSpinTimestamp: profile.spinState?.lastSpinTimestamp,
            lastRewardWon: profile.spinState?.lastRewardWon
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST perform spin
router.post('/spin', auth, async (req, res) => {
    try {
        let profile = await GameProfile.findOne({ userId: req.user.id });
        if (!profile) {
            profile = await GameProfile.create({ userId: req.user.id });
        }

        const now = new Date();
        const nextAvailable = profile.spinState?.nextSpinAvailableAt;

        if (nextAvailable && now < new Date(nextAvailable)) {
            return res.status(403).json({
                message: 'Spin not available yet',
                nextAvailable
            });
        }

        // Determine prize
        const prize = getRandomPrize();

        // Calculate next availability (Midnight of tomorrow)
        const tomorrowMidnight = new Date();
        tomorrowMidnight.setHours(24, 0, 0, 0);

        // Update profile
        profile.spinState = {
            lastSpinTimestamp: now,
            nextSpinAvailableAt: tomorrowMidnight,
            lastRewardWon: prize.label
        };

        // Add points if it's an XP prize
        if (typeof prize.value === 'number') {
            profile.points += prize.value;
        }

        await profile.save();

        res.json({
            success: true,
            prize: prize,
            nextSpinAvailableAt: tomorrowMidnight
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
