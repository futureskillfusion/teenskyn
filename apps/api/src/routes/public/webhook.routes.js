import { Router } from 'express';
import { stripe } from '../../lib/stripe.js';
import { getOrderByStripeSessionId, upsertCustomerByEmail } from '../../services/orderService.js';
import { decrementInventoryForOrder } from '../../services/inventoryService.js';
import { prisma } from '../../lib/prisma.js';

export const webhookRouter = Router();

webhookRouter.post('/', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = await getOrderByStripeSessionId(session.id);

    if (order && order.status === 'pending') {
      const email = session.customer_details?.email || session.customer_email || '';
      const name = session.customer_details?.name || null;

      const customer = email ? await upsertCustomerByEmail({ email, name }) : null;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'paid',
          customerEmail: email,
          customerId: customer?.id,
          stripePaymentIntentId: session.payment_intent || null,
        },
      });

      await decrementInventoryForOrder(order.id);
    }
  }

  res.json({ received: true });
});
