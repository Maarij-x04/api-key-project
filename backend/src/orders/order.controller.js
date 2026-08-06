const orderModel = require('./order.model');
const productModel = require('../products/product.model');

async function create(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ error: 'productId and quantity are required' });
    }

    const product = await productModel.findById(productId, req.apiKey.application_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const subtotal = product.price * quantity;
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // simple 5% tax example
    const total = subtotal + tax;

    const order = await orderModel.createOrder({
      applicationId: req.apiKey.application_id,
      productId,
      quantity,
      subtotal,
      tax,
      total,
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const orders = await orderModel.listByApplication(req.apiKey.application_id);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const order = await orderModel.findById(req.params.id, req.apiKey.application_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne };