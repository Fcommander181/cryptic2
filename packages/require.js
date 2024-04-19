const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const { requiresAuth, auth } = require("express-openid-connect");
const ethers = require("ethers");
const axios = require("axios");
const bodyParser = require("body-parser");

module.exports = {
  createError,
  express,
  path,
  cookieParser,
  logger,
  mongoose,
  auth,
  requiresAuth,
  ethers,
  axios,
  bodyParser,
};
