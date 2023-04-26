
const exportedMethods = {
    checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },
  checkName(str, varName){
    str = this.checkString(str, varName);
    if (/\d/.test(str)) throw `${varName} cannot contain any numbers`
    if (str.length < 2 || str.length > 25) throw `${varName} should be at least 2 characters long with a max of 25 characters`
    return str
  },
  checkEmail(str, varName){
    str = this.checkString(str, varName);
    str = str.toLowerCase();
    if (/\s/.test(str)) throw `${varName} can't have any empty spaces`;
    if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-zA-Z]{2,})$/.test(str)) throw `${varName} should be a valid email address`;
    return str;
  },
  checkPassword(str, varName){
    if (!str) throw `Error: You must supply a ${varName}!`;
    if (typeof str !== 'string') throw `Error: ${varName} must be a string!`;
    if (str.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (str.length<8) throw `${varName} must be a minimum of 8 characters long` 
    if (/\s/.test(str)) throw `${varName} can't have any empty spaces`;
    if (!/[A-Z]/.test(str)) throw `${varName} must contain at least one uppercase character`
    if (!/[0-9]/.test(str)) throw `${varName} must contain at least one number`
    if (!/[^a-zA-Z0-9\s]/.test(str)) throw `${varName} must contain at least one special character`;
    return str
  },
  checkRole(str, varName){
    str= str.trim()
    str = str.toLowerCase();
    if (str !== 'admin' && str !== 'user') throw `invalid values for ${varName}`
    return str;
  }
}

export default exportedMethods;