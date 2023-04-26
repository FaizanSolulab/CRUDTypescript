import express from 'express';
import logger from "../config/logger";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

export const refreshToken = async(req: express.Request, res: express.Response) => {
    const refreshToken = req.body.refreshToken;

    if(!refreshToken){
        return res.status(401)
        .json({
            error: 'Refresh token missing'
        });
    }

    try {
        const decoded:any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "");

        const accessToken = jwt.sign({
            id: decoded?.id },
            process.env.ACCESS_TOKEN_SECRET || "",
            {expiresIn: '15m'}
        );
        return res.status(200).json({ accessToken });
        
    } catch (error) {
        logger.error("Error occured in controllers/refreshToken.ts", error);
        res.status(500).json({ error: "Server error" });
      }
}
