import express from 'express';
import signupRouter from './signup';
import loginRouter from './login';
import logoutRouter from './logout';
import forgotPasswordRouter from './forgotPassword';
import resetPasswordRouter from './resetPassword';
import verifyAuthRouter from './isAuth';
import savedUniversitiesRouter from './savedUniversities';

const authRouter = express.Router();

// Mount all auth routes
authRouter.use('/signup', signupRouter);
authRouter.use('/login', loginRouter);
authRouter.use('/logout', logoutRouter);
authRouter.use('/forgot-password', forgotPasswordRouter);
authRouter.use('/reset-password', resetPasswordRouter);
authRouter.use('/verify', verifyAuthRouter);
authRouter.use('/saved-universities', savedUniversitiesRouter);

export default authRouter;
