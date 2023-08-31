import {validateEmail, validateLength, validatePassword, validateString} from '../validationConstraints';

export const validateInput = (id, value) => {
  if (id === 'firstname' || id === 'lastname') {
    return validateString(id, value);
  } else if (id === 'email') {
    return validateEmail(id, value);
  } else if (id === 'password') {
    return validatePassword(id, value);
  } else if (id === 'about') {
    return validateLength(id, value, 0, 150, true);
  }else if (id === 'chatName') {
    return validateLength(id, value, 5, 20, false);
  }
};
