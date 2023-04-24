import {reports} from "../config/mongoCollections.js"
import {ObjectId} from "mongodb";


const create = async (anonymous, user, category, date, time, classSection, involved, desc) => {
    if(!category || !user || !date || !time || !classSection || !involved || !desc){throw "invalid params yo"}
    //validate date and time somehow???
    user = user.trim();

    let newReport = {
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
        return true;
    }
    const reportCollection = await reports();
    let createInfo = await reportCollection.insertOne(newReport);


    if(!createInfo.acknowledged || !createInfo.insertedId){throw "could not add report"}


    return true;
}

const get = async (id) => {
    if(!id){throw "must input an id"}
    if(typeof(id)!="string"){throw "id must be a string"}
    id = id.trim();
    if(id.length == 0){throw "id string cannot be empty"}
    if(!ObjectId.isValid(id)){throw "invalid id"}
    
    const reportCollection = await reports();
    const output = await reportCollection.findOne({_id: new ObjectId(id)});
    
    if (!output) {throw "no report with that id"}
    output._id = output._id.toString();
    return output;
}

const getAll = async (user) => {
    let reportCollection = await reports();
    let allReports = await reportCollection.find({user: user}).toArray();

    //if (!allReports || allReports.length == 0){throw {errorCode: 400, errorMessage: "Error: user has no reports"}}
    if (!allReports || allReports.length == 0){allReports = []}
    
    for(let i = 0; i < allReports.length; i++){
        allReports[i]._id = allReports[i]._id.toString();
    }

    return allReports;
}




export{
    create,
    get,
    getAll
}