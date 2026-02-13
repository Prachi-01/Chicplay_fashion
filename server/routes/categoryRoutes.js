const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

// All routes are admin protected in a real app, but for now we use auth
// In index.js we can apply admin middleware globally for this route

router.get('/archetypes', categoryController.getArchetypes);
router.post('/archetypes', categoryController.createArchetype);
router.put('/archetypes/:id', categoryController.updateArchetype);
router.post('/archetypes/:id/banner', categoryController.uploadArchetypeBanner);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

router.post('/bulk-assign', categoryController.bulkAssign);

module.exports = router;
