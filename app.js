import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticDir = express.static(__dirname + '/public');

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
      req.method = req.body._method;
      delete req.body._method;
    }
  
    // let the next middleware run:
    next();
};

app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');



app.use(
  session({
    name: 'AuthCookie',
    secret: "hehe secret",
    user: "",
    loggedIn: false,
    error: {status: 200, message: ""},
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 99999999999}
  })
);

app.use('/login', (req,res,next) => {
  if (req.session.user){
      switch (req.session.user.role){
          case "admin":
              return res.redirect('/admin');
              break;
          case "user":
              return res.redirect('/my-reports');
              break;
          default:
              next()
      }
  }
  else next()
})
app.use('/register', (req,res,next) => {
  if (req.session.user){
      switch (req.session.user.role){
          case "admin":
              return res.redirect('/admin');
              break;
          case "user":
              return res.redirect('/my-reports');
              break;
          default:
              next()
      }
  }else{
      next();
  }
})




app.get('/logout', (req, res, next) => {
    if (!req.session.loggedIn) {
        res.redirect("/login")
    }
    next();
});

app.use((req, res, next) => {
    let auth = false;
    if(req.session.loggedIn){auth = true;}
    console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} Authenticated: ${auth} user: '${req.session.user}'`);
    next();
});
app.get('/', (req,res,next) =>{
  if (!req.session.user){
      res.redirect('/login');
  }else {
      switch (req.session.user.role){
          case "admin":
              return res.redirect('/admin');
              break;
          case "user":
              return res.redirect('/my-reports');
              break;
          default:
              return res.redirect('/login');
          
      }
      next();
  }

})


configRoutes(app);


app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});