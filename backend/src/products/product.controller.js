const productModel = require('./product.model');

// req.apiKey.application_id tells us which application (and therefore
// which set of products) this API key is scoped to.

async function create(req, res, next) {
  try {
    const { title, category, price, quantity, vendor } = req.body;
    if (!title || price === undefined) {
      return res.status(400).json({ error: 'title and price are required' });
    }

    const product = await productModel.createProduct({
      applicationId: req.apiKey.application_id,
      title, category, price, quantity, vendor,
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const products = await productModel.listByApplication(req.apiKey.application_id);
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const product = await productModel.findById(req.params.id, req.apiKey.application_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { title, category, price, quantity, vendor } = req.body;
    const product = await productModel.updateProduct(req.params.id, req.apiKey.application_id, {
      title, category, price, quantity, vendor,
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await productModel.deleteProduct(req.params.id, req.apiKey.application_id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted', id: deleted.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, update, remove };