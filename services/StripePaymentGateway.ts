import Stripe from "stripe";
import orderItemModel from "../src/models/order-Item";
import { generateEmailTemplate } from "../utils/EmailTemlate";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

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
