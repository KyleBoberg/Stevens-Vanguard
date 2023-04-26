import {Router} from 'express';
const router = Router();
import {reportData} from "../data/index.js"
import validation from "../helpers.js"
import userData from '../data/users.js'
const rootMiddleware = async (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect("/home")
  }else{
    res.redirect("/login");
  }
}

router.route('/').get(rootMiddleware, async (req, res) => {
  //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
  return res.json({error: 'YOU SHOULD NOT BE HERE!'});
});

router.route('/home').get(async (req, res) => {
  //code here for GET
  try{
    res.status(200).render("homepage",{title: "home"});
  }catch(e){
    res.json(e).status(400)
  }
}).post(async (req, res) => {
  if(req.body.text_input_home){
    req.session.homepageReport = req.body.text_input_home;
  }
  if(req.session.user){
    res.redirect("/report")
  }else{
    res.redirect("/login")
  }
});

router.route('/report')
  .get(async (req, res) => {
    //code here for GET
    try{
      if(!req.session.homepageReport){
        res.status(200).render("report",{title: "Report A Violation"});
      }else{
        res.status(200).render("report",{title: "Report A Violation", default: req.session.homepageReport});
      }
    }catch(e){
      res.json(e).status(400)
    }
  })
  .post(async (req, res)=>{
    let newReport = req.body;
    //console.log(newReport)
    let anonymous = false;
    if(newReport.anonymous){
      anonymous = true;
    }
  
    try{
      await reportData.create(anonymous, req.session.user, newReport.category, newReport.date, newReport.time, newReport.class, newReport.involved, newReport.text_input)
      res.redirect("/my-reports")
    }catch(e){
      res.status(400).json(e)
    }
    
  }

);

router.route('/my-reports').get(async (req, res) => {
  //code here for GET
  let reports = await reportData.getAll(req.session.user)
  try{
    if(reports.length != 0){
      res.status(200).render("my-reports",{title: "My Reports", reports: reports});
    }else{
      res.status(200).render("my-reports",{title: "My Reports", none: "No reports yet"});
    }
  }catch(e){
    res.json(e).status(400)
  }
});

router.route('/resources').get(async (req, res) => {
  //code here for GET
  try{
    res.status(200).render("resources",{title: "Honor Code Resouces"});
  }catch(e){
    res.json(e).status(400)
  }
});

router
  .route('/login')
  .get(async (req, res) => {
    //code here for GET
    return res.render("login", {title: "Login", error: ""});
  })
  .post(async (req, res) => {
    //code here for POST
    let {emailAddressInput, passwordInput} = req.body;
    try{
      emailAddressInput = validation.checkEmail(emailAddressInput,"Email Address");
      passwordInput = validation.checkPassword(passwordInput, "Password");
    } catch (e){
      return res.status(400).render('login', {title: "Login Form", error: e})
    }
    try {
      let user = await userData.checkUser(emailAddressInput,passwordInput);
      if (user) {
        req.session.user = user;
        req.session.loggedIn = true;
        res.redirect('/home')
      }
    }catch (e){
      return res.status(400).render('login', {title: "Login Form", error: e})
    }
    
    
    
  });
router
  .route('/register')
  .get(async (req, res) => {
    //code here for GET
    return res.render('register', {title: "Register Form"})
  })
  .post(async (req, res) => {
    //code here for POST
    let {firstNameInput,lastNameInput,emailAddressInput,passwordInput,confirmPasswordInput,roleInput} = req.body;
    let missing = []
    //if any are missing you will re-render the form with a 400 status code explaining to the user which fields are missing. 
    if (!firstNameInput) missing.push("First Name")
    if (!lastNameInput) missing.push("Last Name")
    if (!emailAddressInput) missing.push("Email Address")
    if (!passwordInput) missing.push("Password")
    if (!confirmPasswordInput) missing.push("Confirm Password")
    if (!roleInput) missing.push("Role")
    if (missing.length >0) return res.status(400).render("register",{title: "Register Form", error: `Missing: ${missing.join(', ')}`})
    try{
      firstNameInput = validation.checkName(firstNameInput,"First Name");
      lastNameInput = validation.checkName(lastNameInput,"Last Name");
      emailAddressInput = validation.checkEmail(emailAddressInput, "Email Address");
      passwordInput = validation.checkPassword(passwordInput,"Password")
      if (passwordInput !== confirmPasswordInput) throw "password and confirm Password must match"
      roleInput = validation.checkRole(roleInput, "Role")
    } catch (e){
      return res.status(400).render("register",{title: "Register Form", error: e})
    }
    try{
      let insertedUser =  (await userData.createUser(firstNameInput,lastNameInput,emailAddressInput,passwordInput,roleInput)).insertedUser;
      if (insertedUser === true) return res.redirect('/login')
    } catch (e){
      return res.status(400).render("register",{title: "Register Form", error: e})
    }
    return res.status(500).render('error', {title: 'Error',message: "Internal Server Error"})
  });
router.route('/logout').get(async (req, res) => {
    //code here for GET
    req.session.destroy();
    return res.render("logout", {title: "Logout"});
  
});




export default router;