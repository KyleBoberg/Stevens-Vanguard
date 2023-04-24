import {Router} from 'express';
const router = Router();
import {reportData} from "../data/index.js"

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

    req.session.user = req.body.emailAddressInput;

    req.session.loggedIn = true;
    res.redirect("/home")
    
  });

router.route('/logout').get(async (req, res) => {
    //code here for GET
    req.session.destroy();
    return res.render("logout", {title: "Logout"});
  
});




export default router;