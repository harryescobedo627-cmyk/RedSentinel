const express = require('express');
const uploadController = require('./controllers/uploadController');
const uploadControllerDebug = require('./controllers/uploadController_debug');
const diagnoseController = require('./controllers/diagnoseController');
const forecastController = require('./controllers/forecastController');
const recommendController = require('./controllers/recommendController');
const executeController = require('./controllers/executeController');
const chatController = require('./controllers/chatController');

const router = express.Router();

router.get('/test', uploadControllerDebug.test);
router.post('/test-upload', uploadControllerDebug.testUploadSimple);

router.post('/upload', uploadController.uploadCsv);
router.get('/data', uploadController.getData);
router.get('/diagnose', diagnoseController.diagnose);
router.get('/forecast', forecastController.forecast);
router.post('/recommend', recommendController.recommend);
router.post('/execute', executeController.execute);

router.post('/chat', chatController.sendMessage);
router.get('/chat/history/:sessionId', chatController.getHistory);
router.delete('/chat/history/:sessionId', chatController.clearHistory);

module.exports = router;
