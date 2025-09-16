import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  let token = req.headers.authorization;
  if (token) {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { email, id, role, username } = decoded;
    req.user = { email, id, role, username };
    next();
  } else {
    res.json({
      message: "unauthenticated",
      code: 401,
    });
  }
};

export default authenticate;