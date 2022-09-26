const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const hpp = require('hpp');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

dotenv.config({ path: './config.env' });

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// const logger = app.use(morgan('combined'));
// console.log(logger);
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP! Try again in an hour.',
});

app.use('/api', limiter);
app.use(cors());
app.use(cookieParser());
// app.use(hpp);
app.use(helmet());
app.use(compression());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '20kb' }));

// Routes are listed bellow
app.use('/api', require('./routes'));

app.all('*', (req, res, next) => {
  next(new AppError(`this route is not supported ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
// module.exports = logger;
