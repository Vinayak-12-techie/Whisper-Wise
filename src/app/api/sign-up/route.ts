import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    // if a username already exists and verified then we cant give that username to another user
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already taken",
        },
        { status: 400 }
      );
    }

    const exisitingUserByEmail = await UserModel.findOne({
      email,
    });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (exisitingUserByEmail) {
      // User exists with Email & verified as well
      if (exisitingUserByEmail.isVerified) {
        return Response.json(
          { success: false, message: "User already exist with this Email" },
          {
            status: 500,
          }
        );
      }
      // User exists with Email & not verified, so updating the details
      else {
        const hashedPassword = await bcrypt.hash(password, 10);
        exisitingUserByEmail.password = hashedPassword;
        exisitingUserByEmail.verifyCode = verifyCode;
        exisitingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await exisitingUserByEmail.save();
      }
    } else {
      //No user found by that Email, so it's a new user, so create a new user and save it.
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    //send verification Email

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        {
          status: 500,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "user Registered successfully, please verify your Email",
      },
      {
        status: 201,
      }
    );
  } catch (err) {
    console.log("Error Registring user", err);
    return Response.json(
      {
        success: false,
        message: "Error registring User",
      },
      {
        status: 500,
      }
    );
  }
}
