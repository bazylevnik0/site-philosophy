const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { auth } = require('express-openid-connect');
const filesystem = require('fs');
const parser  = require("body-parser")

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'M6n00659yxiGY71TkdrEFNmhSZ1ZpbD-7egLiKFcUdWyU7aZkkc9ksDY-3zwEHnx',
  baseURL: 'https://site-philosophy.herokuapp.com',
  clientID: '2wU8FR4SbWnHmrJsgNa7YBynPVtuCykq',
  issuerBaseURL: 'https://bazylevnik0.us.auth0.com'
};


express()
  .use(express.static(path.join(__dirname, 'public'))) 
  .use(auth(config))
  .use(parser.urlencoded({extended : true}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/content', function (req, res) {
			//get content list
			var texts = []
			filesystem.readdirSync('./public/articles/').forEach( el => texts.push(el))
			//show content
			res.render('pages/content', { texts_out : texts })
  		  })
  .get('/text:id'   , (req, res) => res.render('pages/text',{ reading_out : req.params.id }))
  .get('/input'  , (req, res) => res.send(req.oidc.isAuthenticated() ? res.render('pages/input') : res.redirect('/') ))
  .post("/submit", function (req,res) {
      text = new Text ( req.body.title , req.body.text , req.oidc.user.name)
      text.id = text_in.length
      text_in.push(text)
      res.redirect('/input')
   })
   .get('/mod', (req, res) => {
      if (req.oidc.isAuthenticated()) {
	if(req.oidc.user.nickname == "bazylevnik0"){
	   if(req.oidc.user.sub == "google-oauth2|118050277470846190009"){
		console.log(text_in)
	   } else res.send("no access")
	} else res.send("no access")
      } 
      res.redirect("/")
   })
   .get('/post:id', (req,res) => {
      if (req.oidc.isAuthenticated()) {
	if(req.oidc.user.nickname == "bazylevnik0"){
	   if(req.oidc.user.sub == "google-oauth2|118050277470846190009"){
		let id = req.params.id
		let title = text_in[id].title
		    title = title.split(" ")
		    title = title.join("_")
		    title = title.toUpperCase()
		    title = title.split(",").join('')
		    title = title.split(".").join('')
		let body  = text_in[id].body
		filesystem.writeFile(__dirname+'/public/articles/'+title+'.ejs', body , function (err) {
  			if (err) throw err;
  			console.log("id: " + id + ",title: " + title + ' - saved!');
		});
	   } else res.send("no access")
	} else res.send("no access")
      }
      res.redirect("/")
   })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
   
var Text = function (t,b,f) {
	this.id    = undefined;
	this.title = t;
	this.body  = b;
	this.from  = f;
}
var text;
var text_in = []	
