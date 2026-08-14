export default async function createOrder(req, res) {

    const user = user

    if(user == null){
        res.status(401).json({message : "You need to be logged in to place an order"});
        return;
    }

    let orderId = "ORD0000001"

    const orderData = {
        orderId :"ORD0000001",
        email : user.email,
        firstName : user.firstName,
        lastName : user.lastName,
        addressLineOne : req.body.addressLineOne,
        addressLineTwo : req.body.addressLineTwo,
        city : req.body.city,
        state : req.body.state,
        postalCode : req.body.postalCode,
        phone : req.body.phone,
        country : req.body.country,
        total = 0,
        item : []
    }

    if(req.body.firstName !=null &&  req.body.firstName != ""){
        orderData.firstName = req.body.firstName
    }
    if(req.body.lastName !=null &&  req.body.lastName != ""){
        orderData.lastName = req.body.lastName
    }


    try{
        const lastOrder = await Order.findOne().sort({date : -1})
        if(lastOrder != null){
            const lastOrderIdInString = lastOrder.orderId
            const lastOrderNumberInString = lastOrderId.replace("ORD", "")
            const lastOrderNumber = parseInt(lastOrderNumberInString)
            const newOrderNumberInString = lastOrderNumber + 1
            const paddedNewOrderNumberInString = newOrderNumber.padStart(8, "0")
            orderId = "ORD" + newOrderNumberInString 
        }
        for(let i=0; i<req.body.items.length; i++){
            const product = await Product.findOne({productId :req.body.items[i].productId})
            if(product == null || !product.isAvailable){
                res.status(400).json({message : "Product with ID " + req.body.items[i].productId + " is not available"});
                return;
            }
            else{
                orderData.items.push({
                    product : {
                        productId : product.productId,
                        name : product.name,
                        price : product.price,
                        labelledPrice : product.labelledPrice,
                        images : product.images[0],
                    },
                    quantity : req.body.items[i].quantity
                })
            }
            orderData.total += product.price * req.body.items[i].quantity

        }

        const newOrder = new Order(orderData)
        await newOrder.save()
        res.status(201).json({message : "Order created successfully", orderId : orderId})

    }catch(error){
        console.error("Error generating order ID:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }

}