const express=require("express");
const app=express();
const bcrypt=require("bcrypt");
const saltRounds=10;
const cors=require("cors");
const mongoose=require("mongoose");
const seed = require("./Seed/Seed");
mongoose.connect("mongodb://127.0.0.1:27017/e_commerce_app",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.connection.once("open",function(){
    console.log("connection established");
});

app.use(express.json());
app.use(cors());
seed();
const User=require("./Models/user");
const Gadget = require("./Models/Gadget");
const Review = require("./Models/Review");


app.post("/api/user/register",function(req,res){
    User.find({},function(err,users){
        if(err)
        {
            console.log("error while finding the users during user registration.");
            res.status(500).json(err);
        }
        else
        {
            let flg=0;
            users.forEach((user)=>{
                if(user.username===req.body.user.username)
                {
                    flg=1;
                    res.json({
                        flag:-1
                    })
                }
            })
            if(flg===0)
                {
                    bcrypt.hash(req.body.user.password,saltRounds,function(err,hash){
                        if(err)
                        {
                            console.log("error while generating the hash during user registartion");
                            res.status(500).json(err);
                        }
                        else
                        {
                            let newUser= {
                                username:req.body.user.username,
                                password:hash,
                                imageUrl:req.body.user.imageUrl,
                                cart:[]
                            };
                            User.create(newUser)
                            .then((user)=>{
                                console.log("user registered");
                                res.status(201).json({
                                    flag:0
                                })
                            })
                            .catch(err=>{
                                console.log("error while creating the user during user registration");
                                res.status(500).json(err);
                            })
                        }
                    })
                }
        }
    });
});

app.post("/api/user/login",function(req,res){
    let flg=0;
    User.find({})
    .then((users)=>{
        users.forEach((user)=>{
            if(user.username===req.body.user.username)
            {
                if(bcrypt.compareSync(req.body.user.password,user.password))
                {
                    flg=1;
                    let crntUser={
                        username:user.username,
                        userId:user._id
                    }
                    res.status(200).json({
                        user:crntUser,
                        flag:1
                    })
                }
                else
                {
                    flg=1
                    res.status(200).json({
                        flag:0
                    })
                }
            }
        })
        if(flg===0)
        {
            res.status(200).json({
                flag:-1
            })
        }
    })
    .catch((err)=>{
        console.log("error while finding the users during user login.");
        res.status(500).json(err);
    });
});

app.get("/api/gadgets/phones/all",function(req,res){
    Gadget.find({Type:1})
    .then((gadgets)=>{
        let items = [];
        gadgets.forEach((item) =>{
            if(item.Type === 1)
                items.push(item);
        })
        res.status(200).json({
            gadgets:items
        })
    })
    .catch((err)=>{
        console.log("error while finding the gadgets in the server");
        res.status(500).json(err);
    })
});

app.get("/api/gadgets/laptops/all",function(req,res){
    Gadget.find({Type:2})
    .then((gadgets)=>{
        let items = [];
        gadgets.forEach((item) =>{
            if(item.Type === 2)
                items.push(item);
        })
        res.status(200).json({
            gadgets:items
        })
    })
    .catch((err)=>{
        console.log("error while finding the gadgets in the server");
        res.status(500).json(err);
    })
});

app.post("/api/gadgets/create",function(req,res){
    if(req.body.crntUser.username === "Admin")
    {
        let newGadget = {
            gadgetName:req.body.gadget.gadgetName,
            imageUrl:req.body.gadget.imageUrl,
            description:req.body.gadget.description,
            Type:req.body.gadget.Type,
            price:req.body.gadget.price,
            amount:req.body.gadget.amount,
            reviews:[]
        }
        Gadget.create(newGadget)
        .then((gadget)=>{
            console.log("Gadget Created");
            res.status(201).json({
                flag:1
            })
        })
        .catch((err=>{
            console.log("error while creating the gadget");
            res.status(500).json(err);
        }))
    }
    else
    {
        res.status(400).json({
            flag:-1
        })
    }
});

app.get("/api/gadget/:id/show",function(req,res){
    console.log("working");
    let reviews = [];
    let flg = 1;
    Gadget.findById(req.params.id)
    .then((gadget)=>{
        let rvs  = gadget.reviews;
        if(rvs.length >0)
        {
            for(let i = 0;i<rvs.length;i++)
            {
                // console.log("working");
                Review.findById(rvs[i])
                .then((review)=>{
                    reviews.push(review);
                    if(reviews.length === rvs.length)
                    {
                        let data = {
                            gadget:gadget,
                            reviews:reviews
                        }
                        // console.log(data);
                        res.status(200).json(data);
                    }
                })
                .catch((err)=>{
                    flg = 0;
                    console.log("Could not get gadget details from the database");
                    res.status(500).json(err);
                })
                if(flg === 0)
                    break;
            }
        }
        else
        {
            let data = {
                gadget:gadget,
                reviews:[]
            }
            // console.log(data);
            res.status(200).json(data);
        }
        
    })
    .catch((err)=>{
        console.log("Could not get gadget details from the database");
        res.status(500).json(err);
    })
});

app.post("/api/gadget/:id/review/add",function(req,res){
    // console.log("working");
    let newReview = {
        reviewText:req.body.review.reviewText,
        rating:req.body.review.rating,
        userDetails:{
            username:req.body.crntUser.username,
            userId:req.body.crntUser.userId
        }
    }
    Review.create(newReview)
    .then((review)=>{
        Gadget.findById(req.params.id)
        .then((gadget)=>{
            gadget.reviews.push(review._id);
            gadget.save()
            .then(()=>{
                console.log("Review created");
                res.status(201).json({
                    flag:1
                })
            })
            .catch((err)=>{
                console.log("Error while creating the review in backend");
                res.status(500).json({
                    err:err,
                    flag:0
                });
            })
        })
    })
    .catch((err)=>{
        console.log("Error while creating the review in backend");
        res.status(500).json({
            err:err,
            flag:0
        });
    })
});

app.get("/api/gadget/:gId/review/:rId/delete",function(req,res){
    // console.log("working in delete");
    Review.findByIdAndDelete(req.params.rId)
    .then(()=>{
        Gadget.findById(req.params.gId)
        .then((gadget)=>{
            for(let i = 0; i<gadget.reviews.length;i++)
            {
                if(String(gadget.reviews[i]) === String(req.params.rId))
                {
                    gadget.reviews.splice(i,1);
                    gadget.save()
                    .then(()=>{
                        res.status(200).json("successfully delted");
                    })
                    .catch((err)=>{
                        console.log("error while finding the gadget to delete the review");
                        res.status(500).json(err);
                    })
                }
            }
        })
    })
    .catch((err)=>{
        console.log("error while deleting the review");
        res.status(500).json(err);
    })
});

app.get("/api/review/:id/get",function(req,res){
    Review.findById(req.params.id)
    .then((review)=>{
        res.status(200).json({
            review:review
        })
    })
    .catch((err)=>{
        console.log("error while finding the review");
        res.status(500).json(err);
    })
});

app.post("/api/review/:id/update",function(req,res){
    Review.findById(req.params.id)
    .then((review)=>{
        review.reviewText = req.body.review.reviewText;
        review.rating = req.body.review.rating;
        review.save()
        .then(()=>{
            console.log("review updated");
            res.status(200).json("updated");
        })
        .catch((err)=>{
            console.log("error while updating the review");
            res.status(500).json(err);
        })
        
    })
    .catch((err)=>{
        console.log("error while finding the review");
        res.status(500).json(err);
    })
});

app.get("/api/gadget/:id/get",function(req,res){
    Gadget.findById(req.params.id)
    .then((gadget)=>{
        res.status(200).json(gadget);
    })
    .catch((err)=>{
        console.log("Error while finding the gadget from the dataabase");
        res.status(500).json(err);
    })
});

app.post("/api/gadget/:id/update",function(req,res){
    if(req.body.isLoggedIn === true)
    {
        if(req.body.crntUser.username === "Admin")
        {
            Gadget.findById(req.params.id)
            .then((gadget)=>{
                gadget.gadgetName = req.body.gadget.gadgetName;
                gadget.imageUrl = req.body.gadget.imageUrl;
                gadget.description = req.body.gadget.description;
                gadget.price = req.body.gadget.price;
                gadget.amount = req.body.gadget.amount;
                gadget.save()
                .then(()=>{
                    console.log("Gaget Updated");
                    res.status(200).json({
                        flag:1
                    })
                })
                .catch((err)=>{
                    console.log("Error while saving the updated the gadget");
                })
            })
            .catch((err)=>{
                console.log("Error while finding the gadget");
                res.status(500).json(err);
            })
        }
        else
        {
            res.json({
                flag:0
            })
        }
    }
    else
    {
        res.status(200).json({
            flag:-1
        })
    }
});

app.post("/api/user/:id/cart/add",function(req,res){
    User.findById(req.params.id)
    .then((user)=>{
        let flag = 0;
        for(let i= 0;i<user.cart.length;i++)
        {
            if(String(req.body.itemId) === String(user.cart[i].itemId))
            {
                user.cart[i].amount+=1;
                flag = 1;
                break;
            }
        }
        if(flag === 0)
        {
            user.cart.push({
                itemId:req.body.itemId,
                amount:1
            })
        }
        user.save()
        .then(()=>{
            res.status(200).json("success");
        })
        .catch((err)=>{
            console.log("Error saving changes to the user");
            res.status(500).json(err);
        })
    })
    .catch((err)=>{
        console.log("Error while finding the user");
        res.status(500).json(err);
    })
});

app.get("/api/user/:id/cart",function(req,res){
    User.findById(req.params.id)
    .then((user)=>{
        let cart = [];
        for(let i = 0;i<user.cart.length;i++)
        {
            Gadget.findById(user.cart[i].itemId)
            .then((gadget)=>{
                cart.push({
                    id:gadget._id,
                    gadgetName:gadget.gadgetName,
                    imageUrl:gadget.imageUrl,
                    price:gadget.price,
                    amount:user.cart[i].amount
                })
                if(cart.length === user.cart.length)
                {
                    res.status(200).json({
                        userDetails:{
                            userId:user._id,
                            username:user.username,
                            imageUrl:user.imageUrl
                        },
                        cart:cart
                    })
                }
            })
            .catch((err)=>{
                console.log("Error while finding the gadget");
                res.status(500).json(err);
            })
        }
        if(user.cart.length === 0)
        {
            res.status(200).json("cart is empty");
        }
    })
    .catch((err)=>{
        console.log("There was an error while finding the user in the database");
        res.status(500).json(err);
    })
});

app.post("/api/user/:id/cart/:itemId",function(req,res){
    User.findById(req.params.id)
    .then((user)=>{
        let cart = user.cart;
        for(let i = 0; i<cart.length; i++)
        {
            if(String(cart[i].itemId) === String(req.params.itemId))
            {
                // console.log("hello present");
                if(req.body.flg === 0)
                {
                    if((cart[i].amount - 1) === 0)
                    {
                        cart.splice(i,1);
                        user.cart = cart;
                        user.save()
                        .then(()=>{
                            res.json({
                                flag:0
                            })
                        })
                        .catch((err)=>{
                            console.log("Error while saving into the cart");
                            res.status(500).json(err);
                        })
                    }
                    else
                    {
                        cart[i].amount -=1;
                        user.cart = cart;
                        user.save()
                        .then(()=>{
                            res.json({
                                flag:1
                            })
                        })
                        .catch((err)=>{
                            console.log("Error while saving into the cart");
                            res.status(500).json(err);
                        })
                    }
                   
                }
                else
                {
                    Gadget.findById(req.params.itemId)
                    .then((gadget)=>{
                        if((cart[i].amount + 1) >= gadget.amount)
                        {
                            res.status(200).json({
                                flag:0
                            })
                        }
                        else
                        {
                            cart[i].amount +=1;
                            user.cart = cart;
                            user.save()
                            .then(()=>{
                                res.status(200).json({
                                    flag:1
                                })
                            })
                            .catch((err)=>{
                                console.log("Error while saving the user details");
                                res.status(500).json(err);
                            })
                        }
                    })
                    .catch((err)=>{
                        console.log("Error while finding the gadget for updating the cart");
                        res.status(500);
                    })
                }
                break;
            }
          
        }
    })
    .catch((err)=>{
        console.log("There was an error while finding the user in the database");
        res.status(500).json(err);
    })
});


app.post("/api/user/:id/cart/pay",function(req,res){
    console.log("Here present");
    User.findById(req.params.id)
    .then((user)=>{
        let total = 0;
        let cart = req.body.cart;
        for(let i = 0;i<cart.length;i++)
        {
            console.log("Here present");
            Gadget.findById(cart[i].id)
            .then((gadget)=>{
                console.log("Here present");
                gadget.amount -= cart[i].amount;
                gadget.save()
                .then(()=>{
                    total +=1;
                })
                .catch((err)=>{
                    console.log("Error while saving the updated gadget");
                })
            })
            .catch((err)=>{
                console.log("Error while finding the gadget during bill payment");
                res.status(500).json(err);
            })
        }
        if(total === cart.length)
        {
            user.cart = [];
            user.save()
            .then(()=>{
                res.status(200).json("success");
            })
            .catch((err)=>{
                console.log("Error while saving the user during bill payment");
                res.status(500).json(err);
            })
        }

    })
    .catch((err)=>{
        console.log("Error while findding the user during bill payment");
        res.status(500).json(err);
    })
});

app.listen(5000,function(req,res){
    console.log("Server started at port 5000 ....");
})