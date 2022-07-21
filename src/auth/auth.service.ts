import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable ()
export class AuthService {

  constructor(private prisma: PrismaService) {}

  async signin (dto: AuthDto) {
    
    // find user by email
    const user = await this.prisma.user.findUnique ({
        where: {
          email: dto.email
        }
      })

    if (!user) {
      throw new ForbiddenException ('Credentials incorrect')
    }
    

    // check password

    const pwMatches = await argon.verify (user.hash, dto.password)

    if (!pwMatches) {
      throw new ForbiddenException ('Credentials incorrect')
    }


    delete user.hash
    return user
  
  }


  async signup (dto: AuthDto) {

    // generating hash
    const hash = await argon.hash (dto.password)

    // saving password in db

    try {

      const user = await this.prisma.user.create ({
          data: { email: dto.email, hash }
        })

      // returning saved user
      delete user.hash
      return user

    }


    catch (error) {

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException ("Credentials taken")
        }
      }

      throw error

    }

  }

}