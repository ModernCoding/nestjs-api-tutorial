import { Injectable } from "@nestjs/common";
import { User, Bookmark } from "@prisma/client";

@Injectable ({})
export class AuthService {

  signin () {
    return "I have signed in"
  }

  signup () {
    return { msg: "I have signed up" }
  }

}