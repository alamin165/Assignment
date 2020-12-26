var express = require('express')
var hbs = require('hbs')

var app= express()
app.set('view engine','hbs');
hbs.registerPartials(__dirname +'/views/partials')

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://alamin165:123456abc@cluster0.tgnmd.mongodb.net/test';  

app.get('/', async (req,res)=>{
    let client= await MongoClient.connect(url);
    let dbo = client.db("ProductDB2");
    let results = await dbo.collection("products").find({}).toArray();
    res.render('index',{model:results})
})
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/search',(req,res)=>{
    res.render('search')
})

app.get('/insert',(req,res)=>{
    res.render('insert')
})
app.post('/doSearch',async (req,res)=>{
    let nameSearch = req.body.txtSearch;
    let client= await MongoClient.connect(url);
    let dbo = client.db("ProductDB2");
    let results = await dbo.collection("products").
        find({productName: new RegExp(nameSearch,'i')}).toArray();
    res.render('index',{model:results})
})

app.post('/doInsert',async (req,res)=>{
    let nameInput = req.body.txtName;
    let colorInput = req.body.txtColor;
    let priceInput = req.body.txtPrice;
    let errorMsg =  {
        name : '',
        price: ''
    }
    if(nameInput !=null && nameInput.length <1){
        errorMsg.name = "Name's length >=1";
    }
    if(priceInput !=null && eval(priceInput)< 0){
        errorMsg.price = 'Price must >=0'
    }
    if(errorMsg.name.length !=0 || errorMsg.price.length){
        res.render('insert',{error:errorMsg})
    }else{
            let newProduct = {
            productName : nameInput,
            price: priceInput,
            color: colorInput
        }
        let client= await MongoClient.connect(url);
        let dbo = client.db("ProductDB2");
        await dbo.collection("products").insertOne(newProduct);
        res.redirect('/')
    }
    
})

app.get('/delete', async (req,res)=>{
    //id: string from URL
    let id = req.query.id;
    //convert id from URL to MongoDB' id
    let ObjectID = require('mongodb').ObjectID(id);
    //the conditon to delete
    let condition = {'_id': ObjectID}
    let client= await MongoClient.connect(url);
    let dbo = client.db("ProductDB2");
    await dbo.collection("products").deleteOne(condition);
    res.redirect('/');

})

app.get('/edit',async (req,res)=>{
    //id: string from URL
    let id = req.query.id;
    //convert id from URL to MongoDB' id
    let ObjectID = require('mongodb').ObjectID(id);
    //the conditon to delete
    let condition = {'_id': ObjectID}
    //get the product by id
    let client= await MongoClient.connect(url);
    let dbo = client.db("ProductDB2");
    let prod = await dbo.collection("products").findOne(condition);
    res.render('edit',{model:prod})
})

app.post('/doEdit',async (req,res)=>{
    let nameInput = req.body.txtName;
    let colorInput = req.body.txtColor;
    let priceInput = req.body.txtPrice;
    let id = req.body.id;
    
    let newValues ={$set : {productName: nameInput,price:priceInput,color:colorInput}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};
    
    let client= await MongoClient.connect(url);
    let dbo = client.db("ProductDB2");
    await dbo.collection("products").updateOne(condition,newValues);
    res.redirect('/');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT)
console.log('Server is running')