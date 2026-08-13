import jwtDecode from 'jwt-decode';

const parseJWT = token => {
  try {
    return jwtDecode(token);
  } catch  {
    return null;
  }
};

export default parseJWT;
