import { ApolloError } from "apollo-server-core";
import bcrypt from 'bcrypt';
import { LoginInput, UserModel } from "../schemas/user.schema";
import Context from "../types/context";
import { signJwt } from "../utils/jwt";

class UserService {
  async createUser(input: any) {
    // call user model to create a user
    return UserModel.create(input);
  }

  async login(input: LoginInput) {
    const user = await UserModel.find().findByEmail(input.email).lean();

    if (!user) {
      throw new ApolloError('Invalid User or Password')
    }

    const passwordIsValid = await bcrypt.compare(input.password, user.password);

    if (!passwordIsValid){
      throw new ApolloError('Invalid User or Password')
    }

    const token  = signJwt(user);

    return token;
  }
}

export default UserService;