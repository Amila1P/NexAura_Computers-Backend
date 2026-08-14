import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        email : {
            type : String,
            required : true
        },
        firstName : {
            type : String,
            required : true
        },
        lastName : {
            type : String,
            required : true
        },
        addressLineOne : {
            type : String,
            required : true
        },
        addressLineTwo : {
            type : String
        },
        city : {
            type : String,
            required : true
        },
        state : {
            type : String,
            required : true
        },
        postalCode : {
            type : String,
            required : true
        },
        country : {
            type : String,
            required : true
        },
        status : {
            type : String,
            required : true,
            default : "Pending"
        },
        notes : {
            type : String
        },
        total : {
            type : Number,
            required : true
        },
        items : [
            {
                productId : {
                    type : String,
                    required : true
                },
                name : {
                    type : String,
                    required : true
                },
                price : {
                    type : Number,
                    required : true
                },
                image : {
                    type : String,
                    required : true
                },
                quantity : {
                    type : Number,
                    required : true,
                }
            }
        ]
    }
)

const Order = mongoose.model("Order", orderSchema);
export default Order;