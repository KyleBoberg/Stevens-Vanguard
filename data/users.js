//import mongo collections, bcrypt and implement the following data functions
import {users} from '../config/mongoCollections.js';
import validation from '../helpers.js'
import bcrypt from 'bcrypt';

const createUser = async (
  firstName,
  lastName,
  emailAddress,
  password,
  role
) => {
  //check for all string
  firstName = validation.checkName(firstName, 'first name');
  lastName = validation.checkName(lastName, 'last name');
  emailAddress = validation.checkEmail(emailAddress, 'email');
  password = validation.checkPassword(password, 'password');
  role = validation.checkRole(role, 'role');
  //checking email address duplicate
  const userCollection = await users();
  if (await userCollection.findOne({emailAddress: emailAddress})) throw `There is already a user with that email address`;
  
  const saltRounds = 16;
  const hash = await bcrypt.hash(password, saltRounds);
  let newUser = {
    firstName: firstName,
    lastName: lastName,
    emailAddress: emailAddress,
    password: hash,
    role: role,
    report: []
  }
  const newInsertInfo = await userCollection.insertOne(newUser);
  if (!newInsertInfo.insertedId) throw "Insert Failed"
  return {insertedUser: true}

};

const checkUser = async (emailAddress, password) => {
  //validation
  emailAddress = validation.checkEmail(emailAddress, "Email")
  password = validation.checkPassword(password, "password")
  const userCollection = await users();
  const target = await userCollection.findOne({emailAddress: emailAddress}) 
  if (!target) throw `This email address is not found`
  const matched = await bcrypt.compare(password, target.password);
  if (!matched) throw "Either the email address or password is invalid"
  let returnUser = {
    firstName: target.firstName,
    lastName: target.lastName,
    emailAddress: target.emailAddress,
    role: target.role,
    report: target.report
  }
  return returnUser
};
export default{
  createUser,
  checkUser
}