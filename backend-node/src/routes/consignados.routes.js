const { Router } = require('express');
const controller = require('../controllers/consignados.controller');

const router = Router();

router.get('/', controller.getConsignados);
router.post('/parceiros', controller.createParceiro);
router.post('/lotes', controller.createLote);
router.put('/lotes/:id/acerto', controller.fecharAcerto);

module.exports = router;