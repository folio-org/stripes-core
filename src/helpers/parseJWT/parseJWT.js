import jwtDecode from 'jwt-decode';

const parseJWT = token => {
  try {
    return jwtDecode(token);
  } catch (e) {
    return null;
  }
};

export default parseJWT;
