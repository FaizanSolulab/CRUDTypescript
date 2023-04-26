import express from 'express';
import {refreshToken}  from '../controllers/refreshToken';

const router = express.Router();


router.post('/', refreshToken);

export {refreshToken};