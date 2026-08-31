const { Router } = require('express');
const controller = require('../controllers/consignados.controller');

const router = Router();

router.get('/', controller.getConsignados);
router.post('/parceiros', controller.createParceiro);
router.put('/parceiros/:id', controller.updateParceiro);
router.delete('/parceiros/:id', controller.deleteParceiro);
router.post('/lotes', controller.createLote);
router.delete('/lotes/:id', controller.deleteLote);
router.put('/lotes/:id/acerto', controller.fecharAcerto);

module.exports = router;