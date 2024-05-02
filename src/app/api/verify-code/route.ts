import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { verifySchema } from "@/schemas/verifySchema";

const verifyCodeSchema = z.object({
  code: verifySchema,
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    //Gets the unencoded version of an encoded component of a Uniform Resource Identifier (URI).
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          sucess: false,
          message: "User Not found",
        },
        {
          status: 500,
        }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          sucess: true,
          message: "User Verified Sucessfully",
        },
        {
          status: 200,
        }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          sucess: false,
          message:
            "Verification code  has expired. Please Sign up again to get a new code",
        },
        {
          status: 400,
        }
      );
    } else {
      return Response.json(
        {
          sucess: false,
          message: "Incorrect Verification Code",
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Error Verifying User", error);
    return Response.json(
      {
        sucess: false,
        message: "Error Verifying User",
      },
      {
        status: 500,
      }
    );
  }
}
