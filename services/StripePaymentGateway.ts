import orderItemModel from "../src/models/order-Item";
import { generateEmailTemplate } from "../utils/EmailTemlate";
import Stripe from "stripe";

const KEY = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(KEY);
export const stripePaymentGateway = async (order: any) => {
  try {
    // Assuming orderItems contains ObjectIds and you're fetching product details
    // Map the orderItems to line_items
    let product: any = null;
    const lineItems = await Promise.all(
      order.orderItems.map(async (orderItemId: any) => {
        // Fetch the product details based on the orderItemId
        const orderItem = await orderItemModel
          .findById(orderItemId)
          .populate("product"); // Adjust the populate field as necessary

        if (!orderItem) {
          throw new Error("Order item not found");
        }

        product = orderItem.product;

        return {
          price_data: {
            currency: "npr", // Set the currency according to your needs
            product_data: {
              name: product.title,
              images: [product.image],
            },
            unit_amount: Math.round(product.price * 100), // Amount in cents
          },
          quantity: orderItem.quantity,
        };
      })
    );

    // const orderItemsHTML =
    console.log(product);

    //   <tr>
    //     <td>${item.product.title}</td>
    //     <td>${item.quantity}</td>
    //     <td>${item.product.price}</td>
    //   </tr>
    // `
    //   .join("");

    // generateEmailTemplate(
    //   user?.fullname ?? "",
    //   order._id.toString(),
    //   totalPrice,
    //   orderItemsHTML,
    //   order.shippingAddress1,
    //   order.city,
    //   order.country,
    //   String(order.zip),
    //   String(order.phone),
    //   user?.email ?? ""
    // );

    // Create a checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONT_URL}/success?session_id={CHECKOUT_SESSION_ID}`, // Update the success URL as necessary
      cancel_url: `${process.env.FRONT_URL}/cancel`, // Update the cancel URL as necessary
    });

    return { id: session.id };
  } catch (err: any) {
    throw new Error(`Stripe Payment Failed: ${err.message}`);
  }
};

export const stripeMobileService = async (order: any) => {
  console.log("mobile", order);
  try {
    // Define and validate essential variables
    if (!order || !order.orderItems) {
      throw new Error("Order details are missing.");
    }
    const email = "RajjiShyamajistrores@gmail.com"; // Set the email statically or pass it as a parameter
    const customerName = "Rajji_Shyamaji_stores";

    // Create a customer with Stripe
    const customer = await stripe.customers.create({
      email,
      name: customerName,
      description: "Payment for items",
    });

    // Fetch each product for the line items
    const lineItems = await Promise.all(
      order.orderItems.map(async (orderItemId: any) => {
        const orderItem = await orderItemModel
          .findById(orderItemId)
          .populate("product");

        if (!orderItem || !orderItem.product) {
          throw new Error(
            `Product not found for order item ID: ${orderItemId}`
          );
        }

        return {
          price_data: {
            currency: "npr",
            product_data: {
              name: orderItem.product.title,
              images: [orderItem.product.image],
            },
            unit_amount: Math.round(orderItem.product.price * 100),
          },
          quantity: orderItem.quantity,
        };
      })
    );

    // Calculate the total amount and serialize order details for metadata
    const totalPrice = lineItems.reduce(
      (sum, item) => sum + item.price_data.unit_amount * item.quantity,
      0
    );
    const metadata = {
      customer_name: customerName,
      order_items: JSON.stringify(lineItems),
      order_total: totalPrice.toString(),
    };

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice, // in cents
      currency: "npr",
      customer: customer.id,
      receipt_email: email,
      metadata,
    });

    // Return client secret for mobile app
    return {
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    };
    // return res.status(STATUS_CODE).json({
    //   success: true,
    //   clientSecret: paymentIntent.client_secret,
    //   customerId: customer.id,
    // });
  } catch (err: any) {
    console.error("Stripe Mobile Payment Error:", err.message);
  }
};
