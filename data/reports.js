import {users,reports} from "../config/mongoCollections.js"
import {ObjectId} from "mongodb";
import userData from "./users.js";

const create = async (req, anonymous, user, category, date, time, classSection, involved, desc) => {
    if(!category || !date || !time || !classSection || !involved || !desc){throw "invalid params yo"}
    //validate date and time somehow???
    

    let newReport = {
        _id: new ObjectId(),
        category: category,
        user: user,
        date: date,
        time: time,
        classSection: classSection,
        involved: involved,
        desc: desc,
        status: "Pending"
    }
    

    if(anonymous){
        const reportCollection = await reports()
        const newInsertInfo = await reportCollection.insertOne(newReport);
        if (!newInsertInfo.insertedId) throw "Insert Failed"
        return true
    }
    const userCollection = await users();
    const target = await userCollection.findOne({emailAddress: user.emailAddress}) 
    if (!target) {
        throw "user not found";
    }

    target.report.push(newReport);

    const updateInfo = await userCollection.updateOne(
        { emailAddress: user.emailAddress },
        { $set: { report: target.report } }
    );

    if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
        throw "could not add report";
    }

    req.session.user = target;

    return true;
}
const get = async (user) => {
    const userCollection = await users();
    const target = await userCollection.findOne({emailAddress: user.emailAddress}) 
    if (!target) {
        throw "user not found";
    }
    let allReports = target.report;

    //if (!allReports || allReports.length == 0){throw {errorCode: 400, errorMessage: "Error: user has no reports"}}
    if (!allReports || allReports.length == 0){allReports = []}
    
   
    return allReports;
}
const getAllReports = async () => {
    const allUsers = await userData.getAll(); // get all users
    const allReports = [];
  
    for (const user of allUsers) {
      const reports = await get(user); // get all reports for user
      allReports.push(...reports); // add reports to array
    }
  
    return allReports;
  };
const getAllAnony = async () =>{
    
        const reportCollection = await reports();
        const allreports = await reportCollection.find().toArray();
        return allreports
}
const changeStatus = async (reportId, status) => {
    if (!reportId) {
      throw "Report ID must be provided";
    }
    if (!status) {
      throw "Status must be provided";
    }
  
    const reportCollection = await reports();
    const updateInfo = await reportCollection.updateOne(
      { _id: ObjectId(reportId) },
      { $set: { status: status } }
    );
  
    if (updateInfo.modifiedCount === 0) {
      throw `Could not update report with ID ${reportId}`;
    }
  
    return true;
  };

export{
    create,
    get,
    getAllReports,
    getAllAnony,
    changeStatus
}