import Product from "../models/product.js";
import isAdmin from "../controllers/userController.js";

export async function createProduct(req, res) {

    if (!isAdmin(req)) {
        res.status(403).json({
            message: "Access Denied, Admins Only"
        })
        return
    }

    try {

        const existingProduct = await Product.findOne({
            productId: req.body.productId
        })

        if (existingProduct != null) {
            res.status(400).json({
                message: "Product with this productId already exists"
            })
            return
        }

        const newProduct = new Product({
            productId: req.body.productId,
            name: req.body.name,
            altNames: req.body.altNames,
            price: req.body.price,
            labelledPrice: req.body.labelledPrice,
            description: req.body.description,
            images: req.body.images,
            brand: req.body.brand,
            model: req.body.model,
            category: req.body.category,
            stock: req.body.stock,
            isFeatured: req.body.isFeatured || false
        })

        await newProduct.save()

        res.status(201).json({
            message: "Product created successfully"
        })


    } catch (error) {
        res.status(500).json({
            message: "Error creating product"
        })
    }
}

export async function getAllProducts(req, res) {
    try {
        const filter = {};
        if (!isAdmin(req)) {
            filter.isAvailable = true;
        }
        if (req.query.featured === "true") {
            filter.isFeatured = true;
        }

        const products = await Product.find(filter);
        res.json(products);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching products"
        })
    }
}

export async function deleteProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "Access Denied, Admins Only"
        })
        return
    }

    try {

        await Product.deleteOne({
            productId: req.params.productId
        })
        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting product"
        })
    }
}

export async function updateProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "Access Denied, Admins Only"
        })
        return
    }

    try {
        const updateFields = {};
        if (req.body.name !== undefined) updateFields.name = req.body.name;
        if (req.body.altNames !== undefined) updateFields.altNames = req.body.altNames;
        if (req.body.price !== undefined) updateFields.price = req.body.price;
        if (req.body.labelledPrice !== undefined) updateFields.labelledPrice = req.body.labelledPrice;
        if (req.body.description !== undefined) updateFields.description = req.body.description;
        if (req.body.images !== undefined) updateFields.images = req.body.images;
        if (req.body.brand !== undefined) updateFields.brand = req.body.brand;
        if (req.body.model !== undefined) updateFields.model = req.body.model;
        if (req.body.category !== undefined) updateFields.category = req.body.category;
        if (req.body.isAvailable !== undefined) updateFields.isAvailable = req.body.isAvailable;
        if (req.body.stock !== undefined) updateFields.stock = req.body.stock;
        if (req.body.isFeatured !== undefined) {
            if (req.body.isFeatured === true) {
                const featuredCount = await Product.countDocuments({
                    isFeatured: true,
                    productId: { $ne: req.params.productId }
                });
                if (featuredCount >= 5) {
                    return res.status(400).json({
                        message: "You can only feature up to 5 products in the slideshow."
                    });
                }
            }
            updateFields.isFeatured = req.body.isFeatured;
        }

        await Product.updateOne({
            productId: req.params.productId
        }, {
            $set: updateFields
        });

        res.status(200).json({
            message: "Product updated successfully"
        })

    } catch (error) {
        res.status(500).json({
            message: "Error updating product"
        })
    }
}


export async function getProductById(req, res) {
    try {
        const product = await Product.findOne({
            productId: req.params.productId
        })
        if (product == null) {
            res.status(404).json({
                message: "Product not found"
            })
        } else {
            if (product.isAvailable) {
                res.json(product)
            } else {
                if (isAdmin(req)) {
                    res.json(product)
                } else {
                    res.status(403).json({
                        message: "Access Denied, Product is not available"
                    })
                }
            }
        }
    } catch (error) {
        res.status(500).json({
            message: "Error fetching product"
        })
    }
}