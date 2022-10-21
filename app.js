const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://andras:Eaeaea123@cluster0.zfr0d.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


//date//
let todaysDate = new Date().toISOString().slice(0, 10)

//schema to use !!plural!!//
const itemsSchema = {
  name: String,
};

//model constructors compiled from Schema definitions !!capital and not plural!!//
const Item = mongoose.model(`Item`, itemsSchema);

//schema used for addin these new items in DB//
const item1 = new Item({
  name: "Welcome to your to-do-list!"
});
const item2 = new Item({
  name: "Hit + to add a new item."
});
const item3 = new Item({
  name: "<--- to delete an item."
});

//items put into an array//
const defaultItems = [item1, item2, item3];

//schema for dinamic lists
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  //call find({}) method, as empty will find all of them//
  Item.find({}, function (err, foundItems) {
    //if the array empty insertMany and redirect to "/" home//
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully added new items!")
        };
      });
      res.redirect("/");
    } else {
      //newListItems EJS in index used for foundItems array with forEach
      //note!! the post route items also being saved in finditems as we still in the same
      res.render("list", { listTitle: "Today", date: todaysDate, newListItems: foundItems });
    };
  });
});

app.post("/", function (req, res) {
  //save into const from list.ejs posts
  const itemName = req.body.newItem;
  //need this for the redirect for post req not from the home route otherwise would direct back to / instead of /whatever
  const listName = req.body.list;
  //using itemsSchema to add new item with the name from post request
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    //save it to same db
    item.save();
    //back to top to check for items if/else
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };
});

app.post("/delete", function (req, res) {
  const chekedItemId = req.body.checkBoxOnChange;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove({ _id: chekedItemId }, function (err) {
      if (!err) {
        console.log("Checked item deleted");
        res.redirect("/")
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: chekedItemId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  // console.log(customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //console.log("Doesn`t exist"); Creating new list //
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // console.log("Existing list!"); Rendering existing list //
        res.render("list", { listTitle: foundList.name, date: todaysDate, newListItems: foundList.items })
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});
//heroku//
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started succesfully");
});         
