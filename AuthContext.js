import BaseContext from "./BaseContext";

class JwtContext extends BaseContext {
  constructor() {
    super({ jwt: null });
  }

  setJwt(jwt) {
    this.updateValue({ jwt });
  }
}

class UserContext extends BaseContext {
  constructor() {
    super({ user: null });
  }

  setUser(user) {
    this.updateValue({ user });
  }
}

export const authContext = new JwtContext();
export const userContext = new UserContext();
