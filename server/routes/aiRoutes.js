const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/analyze-body', aiController.analyzeBody);
router.post('/fit-advice', aiController.getFitAdvice);
router.post('/detect-landmarks', aiController.detectLandmarks);
router.post('/generate-prompt', aiController.generatePrompt);
router.post('/generate-image', aiController.generateImage);
router.post('/virtual-try-on', aiController.virtualTryOn);

module.exports = router;
