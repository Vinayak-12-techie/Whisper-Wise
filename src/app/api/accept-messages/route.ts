import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  // We are getting the user from the session as we have saved te userdate in the session using token
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user._id;
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },
        {
          status: 500,
        }
      );
    } else {
      return Response.json(
        {
          success: true,
          message: "Message accept status update success ",
          updatedUser,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.log("Failed to update user status to accept messages");
    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to found user ",
        },
        {
          status: 404,
        }
      );
    } else {
      return Response.json(
        {
          success: true,
          isAcceptingMessages: foundUser.isAcceptingMessage,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.log("Failed to found user");
    return Response.json(
      {
        success: false,
        message: "Error in getting Message Acceptance Status",
      },
      {
        status: 500,
      }
    );
  }
}
