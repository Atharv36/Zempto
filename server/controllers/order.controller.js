import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

// ✅ Utility: Discount Calculator
export const PriceWithDiscount = (price, discount = 1) => {
    // Use absolute value for price to prevent negative prices from affecting calculations
    const absPrice = Math.abs(Number(price) || 0);
    if (!discount || discount <= 0) return absPrice;
    const discountAmount = Math.ceil((absPrice * Number(discount)) / 100);
    return absPrice - Number(discountAmount);
};

// ✅ Cash On Delivery Controller
export async function CashOnDeliveryController(req, res) {
    try {
        const userId = req.userId;
        const { list_items, totalAmt, addressId, subTotalAmt } = req.body;

        const payload = list_items.map(el => ({
            userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            productId: el.productId._id,
            product_details: {
                name: el.productId.name,
                image: el.productId.image,
            },
            paymentId: "",
            payment_status: "CASH ON DELIVERY",
            delivery_address: addressId,
            subTotalAmt: Math.abs(Number(subTotalAmt) || 0), // Ensure positive value
            totalAmt: Math.abs(Number(totalAmt) || 0) // Ensure positive value
        }));

        const generateOrder = await OrderModel.insertMany(payload);

        await CartProductModel.deleteMany({ userId });
        await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

        return res.json({
            message: "Order Successful",
            error: false,
            success: true,
            data: generateOrder
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ✅ Payment Controller for Stripe Checkout
export async function paymentController(req, res) {
    try {
        const userId = req.userId;
        const { list_items, totalAmt, addressId, subTotalAmt } = req.body;
        const user = await UserModel.findById(userId);

        const line_items = list_items.map(item => {
            // Calculate price with discount and ensure it's positive
            const discountedPrice = PriceWithDiscount(item.productId.price, item.productId.discount);
            // Stripe requires unit_amount to be a positive integer (in smallest currency unit)
            // Ensure it's at least 1 (1 paisa) to avoid "Invalid non-negative integer" error
            const unitAmount = Math.max(1, Math.round(Math.abs(discountedPrice) * 100));
            
            return {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.productId.name,
                        images: Array.isArray(item.productId.image)
                            ? item.productId.image
                            : [item.productId.image], // ✅ FIXED: Ensure it's always an array
                        metadata: {
                            productId: item.productId._id
                        }
                    },
                    unit_amount: unitAmount
                },
                adjustable_quantity: {
                    enabled: true,
                    minimum: 1
                },
                quantity: item.quantity
            };
        });

        const params = {
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: user.email,
            metadata: {
                userId,
                addressId
            },
            line_items,
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`
        };

        const session = await Stripe.checkout.sessions.create(params);

        return res.status(200).json(session);
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ✅ Helper: Prepare Order Payload from Stripe Webhook Line Items
const getOrderProductItems = async ({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status
}) => {
    const productList = [];

    if (lineItems?.data?.length) {
        for (const item of lineItems.data) {
            const product = await Stripe.products.retrieve(item.price.product);

            const payload = {
                userId,
                orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                productId: product.metadata.productId,
                product_details: {
                    name: product.name,
                    image: Array.isArray(product.images) ? product.images[0] : product.images, // pick first image
                },
                paymentId,
                payment_status,
                delivery_address: addressId,
                subTotalAmt: Number(item.amount_total / 100),
                totalAmt: Number(item.amount_total / 100)
            };

            productList.push(payload);
        }
    }

    return productList;
};

// ✅ Stripe Webhook
export async function webhookStripe(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY;
    let event;

    try {
        // Verify webhook signature if secret is provided
        if (endpointSecret) {
            // req.body should be raw buffer for signature verification
            const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
            event = Stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        } else {
            // For development/testing, parse JSON if no secret
            event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            console.warn("⚠️  Webhook secret not configured. Skipping signature verification.");
        }
    } catch (err) {
        console.error("⚠️  Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Stripe webhook event received:", event.type);

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                
                console.log("📦 Processing checkout.session.completed for session:", session.id);
                console.log("👤 User ID:", session.metadata?.userId);
                console.log("📍 Address ID:", session.metadata?.addressId);
                console.log("💳 Payment Status:", session.payment_status);

                // Verify required metadata exists
                if (!session.metadata?.userId || !session.metadata?.addressId) {
                    console.error("❌ Missing required metadata:", {
                        userId: session.metadata?.userId,
                        addressId: session.metadata?.addressId
                    });
                    return res.status(400).json({ 
                        error: 'Missing required metadata',
                        received: true 
                    });
                }

                // Verify payment was successful
                if (session.payment_status !== 'paid') {
                    console.warn("⚠️  Payment status is not 'paid':", session.payment_status);
                    return res.json({ received: true, message: 'Payment not completed' });
                }

                const lineItems = await Stripe.checkout.sessions.listLineItems(session.id);
                console.log("🛒 Line items retrieved:", lineItems.data.length);

                const orderProduct = await getOrderProductItems({
                    lineItems,
                    userId: session.metadata.userId,
                    addressId: session.metadata.addressId,
                    paymentId: session.payment_intent,
                    payment_status: session.payment_status
                });

                console.log("📝 Order payload prepared:", orderProduct.length, "items");

                if (orderProduct.length === 0) {
                    console.error("❌ No order items to create");
                    return res.status(400).json({ error: 'No order items found' });
                }

                const order = await OrderModel.insertMany(orderProduct);
                console.log("✅ Orders created:", order.length);

                if (order && order.length > 0) {
                    await UserModel.findByIdAndUpdate(session.metadata.userId, {
                        shopping_cart: []
                    });
                    await CartProductModel.deleteMany({ userId: session.metadata.userId });
                    console.log("🛒 Cart cleared for user:", session.metadata.userId);
                }

                return res.json({ received: true, ordersCreated: order.length });

            default:
                console.log(`ℹ️  Unhandled event type: ${event.type}`);
                return res.json({ received: true });
        }

    } catch (error) {
        console.error("❌ Stripe webhook error:", error.message);
        console.error("Stack trace:", error.stack);
        return res.status(500).json({ 
            error: 'Webhook processing failed',
            message: error.message 
        });
    }
}


// ✅ Fallback: Verify/Create Order from Session ID (if webhook hasn't processed)
export async function verifyOrderFromSession(req, res) {
    try {
        const { session_id } = req.body;
        const userId = req.userId;

        if (!session_id) {
            return res.status(400).json({
                message: "Session ID is required",
                error: true,
                success: false
            });
        }

        // Retrieve session from Stripe first to get payment_intent
        const session = await Stripe.checkout.sessions.retrieve(session_id);
        
        // Check if order already exists for this payment intent
        const existingOrder = await OrderModel.findOne({
            paymentId: session.payment_intent || session_id
        });

        if (existingOrder) {
            return res.json({
                message: "Order already exists",
                success: true,
                error: false,
                data: existingOrder,
                alreadyExists: true
            });
        }

        // Verify session belongs to this user (session already retrieved above)
        // Convert both to strings for comparison
        if (String(session.metadata?.userId) !== String(userId)) {
            return res.status(403).json({
                message: "Session does not belong to this user",
                error: true,
                success: false
            });
        }

        // Verify payment was successful
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                message: "Payment not completed",
                error: true,
                success: false,
                payment_status: session.payment_status
            });
        }

        // Verify required metadata exists
        if (!session.metadata?.userId || !session.metadata?.addressId) {
            return res.status(400).json({
                message: "Missing required metadata in session",
                error: true,
                success: false
            });
        }

        // Get line items and create order
        const lineItems = await Stripe.checkout.sessions.listLineItems(session_id);
        const orderProduct = await getOrderProductItems({
            lineItems,
            userId: session.metadata.userId,
            addressId: session.metadata.addressId,
            paymentId: session.payment_intent,
            payment_status: session.payment_status
        });

        if (orderProduct.length === 0) {
            return res.status(400).json({
                message: "No order items found",
                error: true,
                success: false
            });
        }

        // Create order
        const order = await OrderModel.insertMany(orderProduct);

        if (order && order.length > 0) {
            await UserModel.findByIdAndUpdate(session.metadata.userId, {
                shopping_cart: []
            });
            await CartProductModel.deleteMany({ userId: session.metadata.userId });
        }

        return res.json({
            message: "Order created successfully",
            success: true,
            error: false,
            data: order,
            created: true
        });

    } catch (error) {
        console.error("Error verifying order from session:", error);
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getOrderDetailsController(req,res) {
    try{
        const userId = req.userId // orderId
        const orderList = await OrderModel.find({userId:userId}).sort({createdAt:-1}).populate('delivery_address')
        return res.json({
            message:"OrderList",
            success:true,
            error:false,
            data:orderList
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}