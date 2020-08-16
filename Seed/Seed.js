const mongoose = require("mongoose");
const User = require("../Models/user");
const Gadget  = require("../Models/Gadget");
const Review  = require("../Models/Review");
const saltRounds = 10;
const bcrypt = require("bcrypt");

function seed()
{
    User.deleteMany({})
    .then(()=>{
        bcrypt.hash("12345",saltRounds)
        .then((hash)=>{
            let newUser={
                username:"Admin",
                password:hash,
                imageUrl:"https://static.dribbble.com/users/992274/screenshots/10722559/media/97b28e41d60b3c2784dac2c1f2bb4216.jpg",
                cart:[]
            }
            User.create(newUser)
            .then((user)=>{
                console.log("Admin Created");
                Gadget.deleteMany({})
                .then(()=>{
                    let newGadget  = {
                        gadgetName:"Nokia Lumia",
                        imageUrl:"https://images.pexels.com/photos/4957/person-woman-hand-smartphone.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
                        description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer porttitor quam ut tempor ullamcorper. Nunc commodo risus vitae turpis facilisis venenatis. Sed in nunc vel urna semper hendrerit. Cras lacinia pretium eros, non pharetra urna dictum sed. Ut sodales tortor quis orci accumsan tincidunt. Phasellus tincidunt egestas est,",
                        Type:1,
                        price:400,
                        amount:10,
                        reviews:[]
                    }
                    Gadget.create(newGadget)
                    .then((gadget)=>{
                        console.log("Gadget created");
                        let newGadget = {
                            gadgetName:"Laptop",
                            imageUrl:"https://images.pexels.com/photos/434346/pexels-photo-434346.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                            description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer porttitor quam ut tempor ullamcorper. Nunc commodo risus vitae turpis facilisis venenatis. Sed in nunc vel urna semper hendrerit. Cras lacinia pretium eros, non pharetra urna dictum sed. Ut sodales tortor quis orci accumsan tincidunt. Phasellus tincidunt egestas est,",
                            Type:2,
                            price:1000,
                            amount:15,
                            reviews:[]
                        }
                        Gadget.create(newGadget)
                        .then((gadget)=>{
                            console.log("Gadget Created");
                            Review.deleteMany({})
                            .then(()=>{

                            })
                            .catch((err)=>{
                                console.log("error while deleting the reviews");
                            })
                        })
                        .catch((err)=>{
                            console.log("error while creating the gadget in the seed");
                        })
                    })
                    .catch((err)=>{
                        console.log("error while creating the gadget in the seed");
                    })
                })
                .catch((err)=>{
                    console.log("error while deletng the gadgets in the seed file");
                })
            })
            .catch(err =>{
                console.log("Error while creating the admin in the seed");
            })
        })
        .catch((err)=>{
            console.log("error while creating the hash in seed");
        })
    })
    .catch((err)=>{
        console.log("error while deleting the users in seed");
    })
}

module.exports = seed;