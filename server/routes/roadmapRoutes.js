import { Router } from 'express';
import {
  deleteNodeImage,
  getRoadmap,
  resetRoadmap,
  saveRoadmap,
  uploadNodeImage
} from '../controllers/roadmapController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/default', getRoadmap);
router.put('/default', saveRoadmap);
router.post('/default/reset', resetRoadmap);
router.post('/default/nodes/:nodeId/images', upload.single('image'), uploadNodeImage);
router.delete('/default/nodes/:nodeId/images/:imageName', deleteNodeImage);

export default router;
