const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.json({
      message: "Forbidden. Admins only.",
      code: 403,
    });
  }
};

export default authorizeAdmin;
