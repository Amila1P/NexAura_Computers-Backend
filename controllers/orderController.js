import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req, res) {

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

export default async function getOrders(req, res){
    try{
        if(req.user == null){

            res.status(401).json({ message: "You need to be logged in to view your orders" });
            return;

        }

        const pageSizeInString = req.params.pageSize || "10" //"10"
        const pageNumberInString = req.params.pageNumber || "1" //"12"

        const pageSize = parseInt(pageSizeInString);
        const pageNumber = parseInt(pageNumberInString); 

        if(pageSize < 1 || pageSize > 100){
            res.status(400).json({ message: "Page size must be between 1 and 100" });
            return;
        }

        if(req.user.isAdmin){

            const orderCount = await Order.countDocuments();

            const totalPages = Math.ceil(orderCount / pageSize);

            const orders = await Order.find().sort({date: - 1}).skip((pageNumber - 1) * pageSize).limit(pageSize);
            res.status(200).json(
                {
                    orders : orders,
                    totalPages : totalPages,
                    total : orderCount
                }
            );

        }else{

            const orderCount = await Order.countDocuments({ email: req.user.email });

            const totalPages = Math.ceil(orderCount / pageSize);

            const Orders = await Order.find({ email: req.user.email }).sort({date: -1}).skip((pageNumber - 1) * pageSize).limit(pageSize);
            res.status(200).json(Orders);

        }

    }catch(error){
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}