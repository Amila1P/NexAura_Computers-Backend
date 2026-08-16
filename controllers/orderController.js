import Order from "../models/order.js";
import Product from "../models/product.js";

export default async function createOrder(req, res) {

    const user = req.user; 

    if (user == null) {
        res.status(401).json({ message: "You need to be logged in to place an order" });
        return;
    }

    let orderId = "ORD0000001";

    const orderData = {
        orderId: orderId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        addressLineOne: req.body.addressLineOne,
        addressLineTwo: req.body.addressLineTwo,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postalCode,
        phone: req.body.phone,
        country: req.body.country,
        total: 0,
        items: [] 
    }

    if (req.body.firstName != null && req.body.firstName != "") {
        orderData.firstName = req.body.firstName;
    }
    if (req.body.lastName != null && req.body.lastName != "") {
        orderData.lastName = req.body.lastName;
    }

    try {
        const lastOrder = await Order.findOne().sort({ date: -1 });
        
        if (lastOrder != null) {
            const lastOrderIdInString = lastOrder.orderId;
            const lastOrderNumberInString = lastOrderIdInString.replace("ORD", "");
            const lastOrderNumber = parseInt(lastOrderNumberInString);
            const newOrderNumber = lastOrderNumber + 1;
            const paddedNewOrderNumberInString = newOrderNumber.toString().padStart(8, "0");
            orderId = "ORD" + paddedNewOrderNumberInString;
            orderData.orderId = orderId;
        }

        for (let i = 0; i < req.body.items.length; i++) {
            const product = await Product.findOne({ productId: req.body.items[i].productId });
            
            if (product == null || !product.isAvailable) {
                res.status(400).json({ message: "Product with ID " + req.body.items[i].productId + " is not available" });
                return;
            } else {
                orderData.items.push({
                    productId: product.productId,
                    name: product.name,
                    price: product.price,
                    image: product.images[0], 
                    quantity: req.body.items[i].quantity
                });
            }
            orderData.total += product.price * req.body.items[i].quantity;
        }

        const newOrder = new Order(orderData);
        await newOrder.save(); 
        
        res.status(201).json({ message: "Order created successfully", orderId: orderId });

    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}