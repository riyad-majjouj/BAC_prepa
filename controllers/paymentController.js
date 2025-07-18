const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// @desc    إنشاء جلسة دفع للاشتراك
// @route   POST /api/payments/create-subscription
// @access  Private
const createCheckoutSession = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.subscription && user.subscription.status === 'active') {
        return res.status(400).json({ message: 'You already have an active subscription.' });
    }
    
    const YOUR_DOMAIN = process.env.CLIENT_URL || 'http://localhost:8080';
    const PRICE_ID = process.env.STRIPE_PRICE_ID;

    if (!PRICE_ID) {
        res.status(500);
        throw new Error('Stripe Price ID is not configured on the server.');
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
        try {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    mongoUserId: userId.toString(),
                },
            });
            stripeCustomerId = customer.id;
            user.stripeCustomerId = stripeCustomerId;
            await user.save();
        } catch (customerError) {
             res.status(500);
             throw new Error('Failed to create Stripe customer.');
        }
    }
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer: stripeCustomerId,
        line_items: [ { price: PRICE_ID, quantity: 1 } ],
        success_url: `${YOUR_DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/payment/cancel`,
        metadata: {
             mongoUserId: userId.toString(),
        }
    });

    res.json({ id: session.id, url: session.url });
});


// @desc    Webhook لاستقبال الأحداث من Stripe
// @route   POST /stripe-webhook (or your defined unique route)
// @access  Public
const handleStripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object;
    
    const findUser = async () => {
        if (session.customer) {
            return await User.findOne({ stripeCustomerId: session.customer }).exec();
        }
        if (session.metadata?.mongoUserId) {
            return await User.findById(session.metadata.mongoUserId).exec();
        }
        return null;
    };


    switch (event.type) {
        case 'checkout.session.completed': {
            const mongoUserId = session.metadata?.mongoUserId;
            if (!mongoUserId) {
                console.error('Webhook Error: checkout.session.completed event without mongoUserId in metadata.');
                break;
            }
            console.log(`✅ Checkout session completed for user: ${mongoUserId}`);
            
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            const user = await User.findById(mongoUserId);

            if (user) {
                user.subscription.subscriptionId = subscription.id;
                user.subscription.plan = 'premium';
                user.subscription.status = subscription.status;
                
                // --- [FIX] التحقق من وجود التاريخ قبل إضافته ---
                if (subscription.current_period_end) {
                    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
                }
                
                await user.save();
                console.log(`   -> User ${user.email} subscription updated to premium.`);
            }
            break;
        }

        case 'customer.subscription.updated': {
            console.log(`🔔 Subscription updated. Status: ${session.status}`);
            const user = await findUser();
            if (user) {
                user.subscription.status = session.status;
                user.subscription.plan = (session.status === 'active') ? 'premium' : 'free';
                
                // --- [FIX] التحقق من وجود التاريخ قبل إضافته ---
                if (session.current_period_end) {
                    user.subscription.currentPeriodEnd = new Date(session.current_period_end * 1000);
                }

                await user.save();
                console.log(`   -> User ${user.email} subscription status updated to: ${session.status}.`);
            }
            break;
        }

        case 'customer.subscription.deleted': {
            console.log(`🗑️ Subscription deleted for customer: ${session.customer}`);
            const user = await findUser();
            if (user) {
                user.subscription.plan = 'free';
                user.subscription.status = 'inactive';
                user.subscription.subscriptionId = null;
                user.subscription.currentPeriodEnd = undefined; // تعيينه إلى undefined لإزالته
                await user.save();
                console.log(`   -> User ${user.email} subscription reverted to free.`);
            }
            break;
        }

        default:
            console.log(`- Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
});


module.exports = { createCheckoutSession, handleStripeWebhook };