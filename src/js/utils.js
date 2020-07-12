exports.asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

exports.sanitizeEmail = (email) => {
  const splitEmail = email.split('@');
  return `${Array(splitEmail[0].length).join('*')}@${splitEmail[1]}`;
};

exports.sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
