//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//establish connection to database (default url + whatever you want your db to be called)
mongoose.connect("mongodb+srv://admin-faisal:faisal_1@cluster0-qelk5.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

//creating the schema
const itemsSchema = {
      name: String,
};
//creating the mongoose model
const Item = mongoose.model("Item", itemsSchema);

//creating the three default documents found on the startup of the site
const errandOne = new Item({
      name: "Welcome to your todoList!",
});

const errandTwo = new Item({
      name: "Hit the + button to add a new item.",
});

const errandThree = new Item({
      name: "<-- Hit this checkbox to delete an item.",
});

const defaultItems = [errandOne, errandTwo, errandThree];

const listSchema = {
    name: String,
    items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {


  Item.find({/*Put nothing here as condition to find all*/}, function(err, foundItems){
      if(foundItems.length === 0){
              Item.insertMany(defaultItems, function(err){
                  if(err){
                    console.log(err);
                  }
                  else{
                    console.log("Success");
                  }
              });
        res.redirect("/");
      } else {
              res.render("list", {listTitle: "Today", newListItems: foundItems});
      }


  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
        name: itemName,
  });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.deleteOne({_id: checkedItemId}, function (err) {
          if(err){
            console.log(err);
          } else{
            console.log("Successfully deleted doc");
            res.redirect("/");
          }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, results){
            if(!err){
              res.redirect("/" + listName);
            }
        });
    }

});

app.get("/:listName", function(req,res){
  const customListName = _.capitalize(req.params.listName); //makes the first letter capitalized so the list path will be the same capitalized or lowercase


    List.findOne({name: customListName}, function(err, foundList){
          if(!err){
              if(!foundList){
                //Create a new list
                  const list = new List({
                      name: customListName,
                      items: defaultItems,
                  });

                  list.save();
                  res.redirect("/" + customListName);
              } else{
                //Show an existing list
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
              }
          }
    });



  // res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
