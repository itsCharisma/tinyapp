const checkEmail = function (emailCheck, objCheck) {
  for (let userID in objCheck) {
    if (emailCheck === objCheck[userID]["email"]) {
      return userID;
    }
  }
  return false;
};



module.exports = { checkEmail };