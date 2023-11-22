const express = require("express");

const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

/* A middleware that parses the body of the request and makes it available in the req.body object. */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


/* This is the root route. It is used to check if the server is running. */
app.get("/", (req, res) => {
  res.status(200).json({ alive: "True" });
});

app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/users', require('./routes/userRoutes'));


app.use(errorHandler);



module.exports = app;
