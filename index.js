const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const multer = require('multer')
const bodyParser = require('body-parser');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const csrf = require('csurf')
const csrfMiddleware = csrf({cookie: true})
var nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://athmakalinyoga.firebaseio.com"
  });

const galleryDoc = mongoose.Schema({
    image:String,
    date : Date,
})
const galleryDB = mongoose.model('gallery',galleryDoc)

const quotesDoc = mongoose.Schema({
    image:String,
    date : Date,
})
const quotesDB = mongoose.model('quotes',quotesDoc)

const userScheme = mongoose.Schema({
    email:String,
    name:String,
    phone:String,
    cls:String,
    date : Date,
})
const dbUser = mongoose.model('classvisit',userScheme)

const blogScheme = mongoose.Schema({
    title   :String,
    desc    :String,
    image   :String,
    blog    :String,
    lang    :String,
    date    :Date,
    related :String,
})
const dbBlog = mongoose.model('blogs',blogScheme)

const classScheme = mongoose.Schema({
    title   :String,
    desc    :String,
    image   :String,
    blog    :String,
    date    :Date,
    related :String,
})
const dbClass = mongoose.model('baseClass',classScheme)

const classTopScheme = mongoose.Schema({
    title   :String,
    desc    :String,
    image   :String,
    lang    :String,
    date    :Date,
    category:String
})
const dbTopClass = mongoose.model('TopClass',classTopScheme)

const eventScheme = mongoose.Schema({
    name   :String,
    events :String,
    desc   :String,
    lang   :String,
    date   :Date,
    status :String
})
const dbEvent = mongoose.model('events',eventScheme)

const mediaDoc = mongoose.Schema({
    title:String,
    url  :String,
    type :String,
    lang :String,
    date :Date,
})
const mediaDB = mongoose.model('media',mediaDoc)

const app = express()

const port = process.env.PORT || 9000

app.set('view engine', 'ejs')
app.set('views', path.join('pages'))
app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({extended: true}));       
app.use(cookieParser());
app.use(csrfMiddleware)


aws.config.update({
    accessKeyId     : 'AKIAJUTBWUWIFZJC6MTQ',
    secretAccessKey : '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',
});
s3 = new aws.S3();

const db = mongoose.connection
const mongoose_url="mongodb+srv://Athma:AthmakalinSangamam@cluster0.6vnkm.mongodb.net/YogaDatabase?retryWrites=true&w=majority"
mongoose.connect(mongoose_url,{
    useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology:true
})

db.once('open',()=>{
    console.log("DB connected")
})

app.all("*", (req, res, next) => {
    var token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token);
    res.locals.csrfToken = token;
    next();
});

app.get('/',(req, res) =>{
    dbEvent.find({status:"new"},(err,data)=>{
        if (err){
            console.log(err)
        } else {
            
            res.render('index.ejs',{data:data })
        }
    }).sort({"date":1})
})

app.get('/login',(req, res) =>{
    res.render('login.ejs')
})

app.get('/class' ,(req,res) => {
    res.render('class.ejs')
})

app.get('/martial' ,(req,res) => {
    dbTopClass.find({category:'Martial'},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('martial.ejs',{'data':data})
        }
    }).sort({"date":-1})
})

app.get('/subClass=:id' ,(req,res) => {
    dbClass.find({related:req.params.id},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('subclass.ejs',{'data':data,'id':req.params.id})
        }
    }).sort({"date":-1})
})

app.get('/subData=:id' ,(req,res) => {
    dbTopClass.findOne({_id:req.params.id},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':data})
        }
    })
})

app.get('/fullClass=:id' ,(req,res) => {
    dbClass.findOne({_id:req.params.id},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('fullClass.ejs',{'data':data})
        }
    }).sort({"date":-1})
})

app.get('/meds' ,(req,res) => {
    dbTopClass.find({category:'Meditation'},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('meds.ejs',{'data':data})
        }
    }).sort({"date":-1})
})

app.get('/history' ,(req,res) => {
    res.render('history.ejs')
})

app.get('/blogs-ln=:id' ,(req,res) => {
    dbBlog.find({"lang":req.params.id.toString()},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('blogs.ejs',{'data':data,"lan":req.params.id.toString()})
        }
    }).sort({"date":-1}).limit(20)
})

app.get('/blPage-English=:id' ,(req,res) => {
    dbBlog.find({"lang":"English"},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':data})
        }
    }).sort({"date":-1}).limit(20).skip(parseInt(req.params.id))
})

app.get('/blPage-Tamil=:id' ,(req,res) => {
    dbBlog.find({"lang":req.params.id.toString()},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':data})
        }
    }).sort({"date":-1}).limit(20).skip(parseInt(req.params.id))
})

app.get('/meds-ln=:id' ,(req,res) => {
    mediaDB.find({"lang":req.params.id.toString()},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('media.ejs',{'data':data,"lan":req.params.id.toString()})
        }
    }).sort({"date":-1})
})

app.get('/media' ,(req,res) => {
    mediaDB.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('media.ejs',{'data':data,"lan": "no"})
        }
    }).sort({"date":-1})
})

app.get('/fullblog-:id' ,(req,res) => {
    dbBlog.findOne({_id: req.params.id},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('fullBlog.ejs',{'data':data})
        }
    })
})

app.get('/gallery' ,(req,res) => {
    galleryDB.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('gallery.ejs',{'data':data})
        }
    }).sort({"date":-1}).limit(18)
})

app.get('/galpage-:id' ,(req,res) => {
    console.log(parseInt(req.params.id))
    galleryDB.find((err, data) => {

        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':data})
        }
    }).sort({"date":-1}).limit(9).skip(parseInt(req.params.id))
})

app.get('/quotes' ,(req,res) => {
    quotesDB.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('quotes.ejs',{'data':data})
        }
    }).sort({"date":-1}).limit(18)
})

app.get('/quotpage-:id' ,(req,res) => {
    console.log(parseInt(req.params.id))
    quotesDB.find((err, data) => {

        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':data})
        }
    }).sort({"date":-1}).limit(9).skip(parseInt(req.params.id))
})

app.get('/mini-gallery' ,(req,res) => {
    galleryDB.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({data})
        }
    }).sort({"date":-1}).limit(3)
})

app.get('/mini-quotes' ,(req,res) => {
    quotesDB.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({data})
        }
    }).sort({"date":-1}).limit(6)
})

app.get('/mini-blog' ,(req,res) => {
    dbBlog.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({data})
        }
    }).sort({"date":-1}).limit(3)
})

app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
  
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
  
    admin
      .auth()
      .createSessionCookie(idToken, { expiresIn })
      .then(
        (sessionCookie) => {
          const options = { maxAge: expiresIn, httpOnly: true };
          res.cookie("session", sessionCookie, options);
          res.end(JSON.stringify({ status: "success" }));
        },
        (error) => {
          res.status(401).send("UNAUTHORIZED REQUEST!");
        }
      );
});

let transporter = nodemailer.createTransport({
    host: "mail.codestormx.in",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.user,
        pass: process.env.pass
    },
  });
  
app.post('/success',(req,res,next) => {
    dbUser.find(
        {
            email:req.body['email'],
            cls:  req.body['cls']
        }
    ,(err,data)=>{
        if (err){
            console.log(err)
        } else {
            console.log('a',data.length)
            if(data.length>1){
                var b = req.body['name']+' U have already Registered!'
                console.log(b)
                res.render('success.ejs',{'name': b,csrfToken: req.csrfToken() })
            } else {
                var mailOptions1 = {
                    from: process.env.user,
                    to: req.body['email'],
                    subject: 'Namaste from Athmakalin Sangamam',
                    html: process.env.html1 +'! ' + req.body['name'] + process.env.html2 
                  };
                  var mailOptions2 = {
                      from: process.env.user,
                      to: process.env.notification_mail,
                      subject: req.body['name']+'has joined Athmakalin Sangamam',
                      html: `<h1>${req.body['name']}  - has approached Athmakalin Sangamam..</h1> <h4>${req.body['name']}'s Contact details:</h4> <p>PhoneNumber ${req.body['phone']}</p>  <p> Email :  ${req.body['email']}</p>`
                    };
                  try {
                      const db = req.body
                      db['date'] = Date.now()
                      dbUser.create(db,(err,data)=>{
                          if (err){
                              console.log(err)
                          } else {
                              transporter.sendMail(mailOptions1, function(error, info){
                                  if (error) {
                                    console.log(error);
                                  } else {
                                    console.log('Email sent: '+ info.response);
                                  }
                              });
                              transporter.sendMail(mailOptions2, function(error, info){
                                  if (error) {
                                    console.log(error);
                                  } else {
              
                                    console.log('Email sent: '+ info.response);
                                  }
                              });
                          }
                      })  
                      console.log('b')
                      res.render('success.ejs',{'name':req.body['name'],csrfToken: req.csrfToken() })
                  } catch (error) {
                      console.log(error)
                  }
            }
        }
    })
    console.log(req.body['name'],req.body['cls'])
    
})

//onlyadmin
app.all("*",(req, res,next)=>{
    const sessionCookie = req.cookies.session || "";
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then((user) => {
        next();
      })
      .catch((error) => {
        res.redirect("/login");
      });
})

app.get("/dash", (req, res)=> {
    res.render('dash')
})

app.get('/blogger',(req,res) => {
    res.render('blogCreate.ejs',{csrfToken: req.csrfToken()})
})

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'athmakalin',
        key: function (req, file, cb) {
            cb(null,  Date.now() + file.originalname); //use Date.now() for unique file keys
        }
    })
});

app.post('/blogger',upload.array('image',1) ,(req,res) => {
    const db = req.body
    try {
        db['image']=req.files[0]['location']
    } catch (error) {
        console.log(error)
    }
    db['date'] = Date.now()
    dbBlog.create(db,(err,data)=>{
        if (err){
            console.log(err)
        } else {
            console.log('suc')
        }
    })
    res.redirect('/dash')
})

app.get("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/login");
  });

app.get('/gallery-upload' ,(req,res) => {
    res.render('galleryUP.ejs',{ csrfToken: req.csrfToken() })
})

app.post('/gallery-upload',upload.array('file',3) ,(req,res) => {
    
    try {
            const db = req.body
            db['image']= req.files[0]['location']
            db['date'] = Date.now()
            if(req.body['type']==="gallery"){
                console.log('gal')
                galleryDB.create(db,(err,data)=>{
                    if (err){
                        console.log(err)
                    } else {
                        console.log('suc')
                    }
                }) 
            } else {
                quotesDB.create(db,(err,data)=>{
                    console.log('qot')
                    if (err){
                        console.log(err)
                    } else {
                        console.log('suc')
                    }
                }) 
            }
    }
    catch (e){
        console.log('e')
    }
    res.redirect('/dash')
})

app.get('/events-upload' ,(req,res) => {
    dbEvent.find((err,data)=>{
        if (err){
            console.log(err)
        } else {
            res.render('events.ejs',{ csrfToken: req.csrfToken() , data:data })
        }
    }).sort({"date":-1})
})

app.post('/events-upload' ,(req,res) => {
    const db = req.body
    dbEvent.create(db,(err,data)=>{
        if (err){
            console.log(err)
        } else {
            res.redirect('/events-upload')
        }
    })  
})

app.get('/eventsComp-:id' ,(req,res) => {
     dbEvent.updateOne(
        {_id: req.params.id},
        {$set: {status: "old"}},
        {upsert: true},
        (err,data)=>{
        if (err){
            console.log(err)
        } else {
             res.redirect('/events-upload')
        }
    })  
})

app.get('/eveDel-:id' ,(req,res) => {
    dbEvent.deleteOne({_id: req.params.id},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':'success'})
        }
    })
})

app.get('/blogDel-:id' ,(req,res) => {
    dbBlog. deleteOne({_id: req.params.id},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':'success'})
        }
    })
})

app.get("/media-upload", (req, res)=> {
    mediaDB.find((err,data)=>{
        if (err){
            console.log(err)
        } else {
            res.render('mediaUp',{data})
        }
    })  
})

app.get('/mediaDel-:id' ,(req,res) => {
    mediaDB. deleteOne({_id: req.params.id},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':'success'})
        }
    })
})

app.get("/blog-list", (req, res)=> {
    dbBlog.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('blog-list.ejs',{'data':data})
        }
    }).sort({"date":-1})
})

app.get("/reg-list", (req, res)=> {
    dbUser.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            
            res.render('regisList.ejs',{'data':data})
        }
    }).sort({"date":-1}).limit(40)
})

app.get("/regpage-:id", (req, res)=> {
    dbUser.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':data})
        }
    }).sort({"date":-1}).limit(40).skip(parseInt(req.params.id))
})

app.post('/video-upload' ,(req,res) => {
    db['date'] = Date.now()
    db['type'] = "video"
    db['url']  = req.body['url'].replace('youtu.be/','youtube.com/embed/')
    db['title']= req.body['title']
    db['lang']= req.body['lang']
    mediaDB.create(db,(err,data)=>{
        if (err){
            console.log(err)
        } else {
            console.log('suc')
        }
    })  
    res.redirect('/dash')
})

app.post('/audio-upload',upload.array('file',1) ,(req,res) => {
    db['date'] = Date.now()
    db['type'] = "audio"
    db['url']  = req.files[0]['location']
    db['title']= req.body['title']
    db['lang']= req.body['lang']
    mediaDB.create(db,(err,data)=>{
        if (err){
            console.log(err)
        } else {
            console.log('suc')
        }
    })  
    res.redirect('/dash')
})

app.get('/gall-list' ,(req,res) => {
    galleryDB.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('gall-list.ejs',{'data':data})
        }
    }).sort({"date":-1})
})

app.get('/gallDel-:id' ,(req,res) => {
    
    galleryDB.deleteOne({_id: req.params.id},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':'success'})
        }
    })
})

app.get('/quote-list' ,(req,res) => {
    quotesDB.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('quote-list.ejs',{'data':data})
        }
    }).sort({"date":-1})
})

app.get('/quoteDel-:id' ,(req,res) => {
    quotesDB.deleteOne({_id: req.params.id},(err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.status(200).send({'data':'success'})
        }
    })
})

app.get('/class-create',(req,res) => {
    dbTopClass.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('classCreate.ejs',{csrfToken: req.csrfToken(),data:data})
        }
    })
})

app.post('/class-create',upload.array('image',1) ,(req,res) => {
    const db = req.body
    try {
        db['image']=req.files[0]['location']
    } catch (error) {
        console.log(error)
    }
    dbClass.create(db,(err,data)=>{
        if (err){
            console.log(err)
        } else {
            console.log('suc')
        }
    })
    res.redirect('/dash')
})

app.get("/class-list", (req, res)=> {
    dbClass.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('class-list.ejs',{'data':data})
        }
    }).sort({"date":-1})
})

app.get('/classDel-:id' ,(req,res) => {
    dbClass. deleteOne({_id: req.params.id},(err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.status(200).send({'data':'success'})
        }
    })
})

app.get('/classDetail-:id' ,(req,res) => {
    dbTopClass.findOne({_id:req.params.id},(err, data) => {
        if (err){
            console.log(err)
        }
        else {
            res.status(200).send( {'title':data.title,'data':data.lang,'category':data.category})
        }
    })
})


app.get('/clstop-create',(req,res) => {
    res.render('clstopCreate.ejs',{csrfToken: req.csrfToken(),val:0})
})

app.post('/clstop-create',upload.array('image',1) ,(req,res) => {
    const db = req.body
    try {
        db['image']=req.files[0]['location']
    } catch (error) {
        console.log(error)
    }
    db['date'] = Date.now()
    
    dbTopClass.findOne({title:req.body.title},(err, data)=>{
        if (err){
            console.log('err')
            dbTopClass.create(db,(err,data)=>{
                if (err){
                    console.log(err)
                } else {
                    console.log('suc')
                    res.redirect('/dash')
                }
            })
        } else {
            console.log('data',data)
            res.render('clstopCreate.ejs',{csrfToken: req.csrfToken(),val:1})
        }
    })
})

app.get("/clstop-list", (req, res)=> {
    dbTopClass.find((err, data) => {
        if (err){
            console.log(err)
        }
        else{
            res.render('clstop-list.ejs',{'data':data})
        }
    }).sort({"date":-1})
})

app.get('/clstopDel-:id' ,(req,res) => {
    dbTopClass. deleteOne({_id: req.params.id},(err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.status(200).send({'data':'success'})
        }
    })
})

app.listen(port,()=>console.log(`Hello Sir runnning at ${port}`))

