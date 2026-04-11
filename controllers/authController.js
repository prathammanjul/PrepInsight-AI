module.exports.renderSignup = (req, res) => {
  res.render("signup");
};

module.exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  const newUser = new User({ username, email });
  await User.register(newUser, password);

  req.flash("success", "Account created 🎉");
  res.redirect("/login");
};

module.exports.renderLogin = (req, res) => {
  res.render("login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back 🎉");

  const redirectUrl = res.locals.redirectUrl || "/";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out 👋");
    res.redirect("/");
  });
};
