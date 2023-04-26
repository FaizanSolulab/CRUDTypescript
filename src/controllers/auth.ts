import express from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Otp from "../models/otp";
import logger from "../config/logger";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();


export const registerUser = async(req: express.Request, res: express.Response)=>{
    logger.info("inside controllers/auth.ts /registerUser");

    try {
        const{
            email,
            password
        } = req.body;

        if(!email || !password){
            logger.error("All fields are mandatory")
            return res
          .status(400)
          .send({
            error: "All fields are mandatory",
          });
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({ error: "Invalid email" });
        }

        const user = await User.findOne({email});
        if (user) {
            logger.error("Email already taken");
            return res
              .status(400)
              .json({ error: "User with this email already exists" });
          }

          const hashedPassword = await bcrypt.hash(password, 10);
      logger.info(`Password hashed successfully for user with email: ${email}`);

      console.log("hashedPassword", hashedPassword);

      const userCreate = await User.create({
        email: email,
        password: hashedPassword,
      });
      console.log("userCreate", userCreate);

      if (!userCreate) {
        logger.error(`Error in User.create(), error`);
        return res.status(400).json({ error: "User registration failed" });
      }

      logger.info(`User successfully created with id: ${userCreate.id}`);


      const sendEmail = async () => {
        logger.info("inside sendEmail");
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({ eemail: email, code: otpCode });

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "faizanmansuri316@gmail.com",
            pass: "eejevistvviuzqjn",
          },
        });

        const mailOptions = {
          from: "faizanmansuri316@gmailcom",
          to: email,
          subject: "Verify OTP",
          text: `Your OTP code is ${otpCode}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            logger.info("Email Sent", +info.response);
          }
        });
      };
      await sendEmail();

      return res.status(201).json({
        id: userCreate.id,
        otpRequested: true,
        verified: false,
      });


        
    } catch (error) {
        logger.error("Error occured in controllers/auth.ts /registerUser", error);
        res.status(500).json({ error: "Server error" });
      }
}

export const verifyOtp = async(req: express.Request, res: express.Response) => {
    logger.info("inside controllers/auth.ts /verifyOtp");
    try {

        const { otp } = req.body;
    const {  email } = req.query;

    if (!otp) {
        logger.error("Please enter OTP first");
        res.status(400).send({ error: "Please enter OTP first" });
      }

      const otpData = await Otp.findOne({ eemail: email });
      if (!otpData || otp !== otpData.code) {
        logger.error("OTP not found");
        return res.status(404).json({ error: "OTP not found" });
      }

      logger.info("Otp has been successfully verified");

      const updatedUser = await User.updateOne({ email }, { verified: true });

      const user = await User.findOne({ email });

      // Delete the OTP data
      await Otp.deleteOne({ eemail: email });

      const accessToken = jwt.sign(
        {
          id: user?._id,
          email: user?.email,
          password: user?.password,
          verified: true,
        },
        process.env.ACCESS_TOKEN_SECRET || "",
        {
          expiresIn: "15m",
        }
      );

      const refreshToken = jwt.sign({
        id: user?._id,
        email: user?.email,
        password: user?.password,
        verified: true,
      },
      process.env.REFRESH_TOKEN_SECRET || "",
      {
        expiresIn: "7d",
      }
      );

      res.cookie("refreshToken", refreshToken,{
        httpOnly: true,
        secure: true,
        sameSite: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ accessToken, user });

    }
        catch (error) {
            logger.error("Error occured in controllers/auth.ts /verify-otp", error);
            res.status(500).json({ error: "Server error" });
          }
        
    
};