const AppError = require("../utils/AppError");
const Products = require("../models/Product");
const { validateCreateProduct } = require("../validation/productValidation");
const { dataUri } = require("../utils/multer");
const { uploader } = require("../utils/cloudinary")

//create new products

const createNewProduct = async (req, res, next) => {
    try {

        if (!req.file) {
            throw new AppError("Please upload product image with field name product_image", 400);
        }

        const fileData = dataUri(req).content;
        const result = await uploader.upload(fileData, {
            folder: "Augustbackend/Product",
        });



        const userId = req.user._id;

        const validation = validateCreateProduct(req.body);

        if (validation.error) {
            throw new AppError(validation.error.message, 400);
        };

        const { title, description, price } = req.body;

        const newProduct = await Products.create({
            title,
            description,
            price,
            user: userId,
            product_image: result.secure_url,
        });

        if (!newProduct) {
            throw new AppError("An error occured while creating product", 404)
        };

        res.status(201).json({
            status: "successful",
            message: "Product created succesfully",
            data: {
                product: newProduct
            }
        })

    } catch (error) {
        next(error)
    }
};

//getallProducts

const getAllProducts = async (req, res, next) => {
    try {
        const products = await Products.find();

        res.status(200).json({
            status: "successful",
            message: "Products fetched successfully",
            data: {
                products
            }
        });

    } catch (error) {
        next(error);
    }
};


//getproductdetails

const getProductDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Products.findById(id);

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        res.status(200).json({
            status: "successful",
            message: "Product fetched successfully",
            data: {
                product
            }
        });

    } catch (error) {
        next(error);
    }
};

// Delete product

const deleteProduct = async (req, res, next) =>{
    try {

        const { id } = req.params;

        const product = await Products.findByIdAndDelete(id);

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        res.status(200).json({
            status: "successful",
            message: "Product deleted successfully",
            data: null
        });

    } catch (error) {
        next(error);
    }
};

const updateProductDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, price } = req.body;

        if (!title || !description || price === undefined) {
            throw new AppError("Please provide title, description and price", 400);
        }

        const product = await Products.findOne({ _id: id, user: req.user._id });

        if (!product) {
            throw new AppError("Product not found or you are not the owner", 404);
        }

        const validation = validateCreateProduct({ title, description, price });
        if (validation.error) {
            throw new AppError(validation.error.message, 400);
        }

        product.title = title;
        product.description = description;
        product.price = price;
        await product.save();

        res.status(200).json({
            status: "successful",
            message: "Product updated successfully",
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createNewProduct,
    getAllProducts,
    getProductDetails,
    deleteProduct,
    updateProductDetails,
}   