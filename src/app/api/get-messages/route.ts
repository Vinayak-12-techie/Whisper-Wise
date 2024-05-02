import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

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

  // cause we have converted the user id into a string in the user model and sometimes it gives a issue in the aggregation pipeline so we have to convert it back to the mongoose object id
  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    // aggregation pipeline to customize the output
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" }, // used to open up the array into seperate documents
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        {
          status: 401,
        }
      );
    }
    return Response.json(
      {
        success: true,
        messages: user[0].messages,
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    return Response.json(
      {
        success: false,
        message: "Error",
      },
      {
        status: 500,
      }
    );
  }
}
