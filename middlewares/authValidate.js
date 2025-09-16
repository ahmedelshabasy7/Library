const authValidate = (req, res, next) => {
  const errors = {};
  const { email, password } = req.body;
  if (!email) {
    errors.email = "email is required field";
  }
  if (!password) {
    errors.password = "password is required field";
  }
  if (Object.keys(errors).length === 0) {
    next();
  } else {
    res.json({
      message: "invalid credentials",
      code: 422,
      errors,
    });
  }
};
export default authValidate;
