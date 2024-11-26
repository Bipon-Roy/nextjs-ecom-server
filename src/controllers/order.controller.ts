import { Request, Response } from "express";
import { OrderModel } from "../models/order.model";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { isValidObjectId } from "mongoose";
import { ProductModel } from "../models/product.model";
import Stripe from "stripe";
import { CartModel } from "../models/cart.model";
import { ICartProduct, IProductsCheckout, IStripeCustomerInfo } from "../types";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const webHookSecret = process.env.STRIPE_WEBHOOK_KEY!;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-11-20.acacia", // Specify Stripe API version for consistency
});

export const getOrderedItems = asyncHandler(async (req: Request, res: Response) => {
    const orders = await OrderModel.find({ userId: req.user._id }).sort("-createdAt");
    if (!orders || orders.length === 0) {
        throw new ApiError(404, "No orders found");
    }

    return res.status(200).json(new ApiResponse(200, orders, "All orders fetched successfully"));
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== "admin") {
        throw new ApiError(401, "Unauthorized Request");
    }
    const validStatus = ["delivered", "ordered", "shipped"];
    const { orderId, deliveryStatus } = await req.body();

    if (!isValidObjectId(orderId) || !validStatus.includes(deliveryStatus)) {
        throw new ApiError(401, "Invalid Data");
    }

    await OrderModel.findByIdAndUpdate(orderId, { deliveryStatus });

    return res.status(200).json(new ApiResponse(200, "Order status updated"));
});

export const stripeInstantCheckoutHandler = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.body;

    if (!isValidObjectId(productId)) {
        throw new ApiError(401, "Invalid Product id!");
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product doesn't exist");
    }

    const line_items = {
        price_data: {
            currency: "USD",
            unit_amount: product.price.discounted * 100,
            product_data: {
                name: product.title,
                images: [product.thumbnail.url],
            },
        },
        quantity: 1,
    };

    const customer = await stripe.customers.create({
        metadata: {
            userId: req.user._id,
            type: "instant-checkout",
            product: JSON.stringify({
                id: productId,
                title: product.title,
                price: product.price.discounted,
                totalPrice: product.price.discounted,
                thumbnail: product.thumbnail.url,
                qty: 1,
            }),
        },
    });

    // Validate environment variables
    if (!process.env.PAYMENT_SUCCESS_URL || !process.env.PAYMENT_CANCEL_URL) {
        throw new ApiError(500, "Payment URLs are not configured");
    }

    // generate payment link and send to client
    const params: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [line_items],
        success_url: process.env.PAYMENT_SUCCESS_URL!,
        cancel_url: process.env.PAYMENT_CANCEL_URL!,
        shipping_address_collection: { allowed_countries: ["US"] },
        customer: customer.id,
    };

    const checkoutSession = await stripe.checkout.sessions.create(params);
    return res
        .status(200)
        .json(new ApiResponse(200, { url: checkoutSession.url }, "Checkout session created successfully"));
});

export const stripeCheckoutHandler = asyncHandler(async (req: Request, res: Response) => {
    const { cartId } = req.body;

    if (!isValidObjectId(cartId)) {
        throw new ApiError(401, "Invalid Product id!");
    }

    // Fetching cart details
    const cartItems = await CartModel.findById(cartId);

    if (!cartItems) {
        throw new ApiError(404, "Cart doesn't exist");
    }

    const line_items = cartItems.products.map((product: IProductsCheckout) => {
        if (!product.price || !product.qty) {
            throw new ApiError(400, "Invalid product details in cart");
        }

        return {
            price_data: {
                currency: "usd",
                unit_amount: Math.round(product.price * 100),
                product_data: {
                    name: product.title,
                    images: [product.thumbnail],
                },
            },
            quantity: product.qty,
        };
    });

    // Create Stripe customer
    const customer = await stripe.customers.create({
        metadata: {
            userId: req.user._id,
            cartId: cartId,
            type: "checkout",
        },
    });

    // Validate environment variables
    if (!process.env.PAYMENT_SUCCESS_URL || !process.env.PAYMENT_CANCEL_URL) {
        throw new ApiError(500, "Payment URLs are not configured");
    }

    // Generate Stripe Checkout session
    const params: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        payment_method_types: ["card"],
        line_items,
        success_url: process.env.PAYMENT_SUCCESS_URL!,
        cancel_url: process.env.PAYMENT_CANCEL_URL!,
        shipping_address_collection: { allowed_countries: ["US"] },
        customer: customer.id,
    };

    const checkoutSession = await stripe.checkout.sessions.create(params);

    return res
        .status(200)
        .json(new ApiResponse(200, { url: checkoutSession.url }, "Checkout session created successfully"));
});

export const stripeWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
        throw new ApiError(400, "Stripe signature header is missing!");
    }

    let event: Stripe.Event;

    try {
        const payload = req.body; // Ensure `bodyParser` for JSON is disabled for this route
        event = stripe.webhooks.constructEvent(payload, signature, webHookSecret);
    } catch (error: any) {
        throw new ApiError(400, `Webhook signature verification failed: ${error.message}`);
    }

    try {
        if (event.type === "checkout.session.completed") {
            const stripeSession = event.data.object as {
                customer: string;
                payment_intent: string;
                amount_subtotal: number;
                customer_details: any;
                payment_status: string;
            };

            const customer = (await stripe.customers.retrieve(
                stripeSession.customer as string
            )) as unknown as IStripeCustomerInfo;

            const { cartId, userId, type, product } = customer.metadata;

            if (type === "checkout") {
                // Fetch cart items
                const cart = await CartModel.findById(cartId);

                if (!cart) {
                    throw new ApiError(404, "Cart not found");
                }

                // Create order
                await OrderModel.create({
                    userId,
                    stripeCustomerId: stripeSession.customer,
                    paymentIntent: stripeSession.payment_intent,
                    totalAmount: stripeSession.amount_subtotal / 100,
                    shippingDetails: {
                        name: stripeSession.customer_details?.name,
                        email: stripeSession.customer_details?.email,
                        address: stripeSession.customer_details?.address,
                    },
                    paymentStatus: stripeSession.payment_status,
                    deliveryStatus: "ordered",
                    orderItems: cart.products,
                });

                // Update product stock
                const updateStockPromises = cart.items.map((product: ICartProduct) => {
                    return ProductModel.findByIdAndUpdate(product.productId, {
                        $inc: { quantity: -product.quantity },
                    });
                });

                await Promise.all(updateStockPromises);

                // Remove cart
                await CartModel.findByIdAndDelete(cartId);
            }

            if (type === "instant-checkout" && product) {
                const productInfo = JSON.parse(product);

                // Create order
                await OrderModel.create({
                    userId,
                    stripeCustomerId: stripeSession.customer,
                    paymentIntent: stripeSession.payment_intent,
                    totalAmount: stripeSession.amount_subtotal / 100,
                    shippingDetails: {
                        name: stripeSession.customer_details?.name,
                        email: stripeSession.customer_details?.email,
                        address: stripeSession.customer_details?.address,
                    },
                    paymentStatus: stripeSession.payment_status,
                    deliveryStatus: "ordered",
                    orderItems: [{ ...productInfo }],
                });

                // Update product stock
                await ProductModel.findByIdAndUpdate(productInfo.id, {
                    $inc: { quantity: -1 },
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Order placed successfully!",
        });
    } catch (error: any) {
        throw new ApiError(500, error.message || "Internal server error!");
    }
});
