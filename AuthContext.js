import BaseContext from './BaseContext';

class AuthContext extends BaseContext {
  constructor() {
    super({ jwt: null });
  }

  setJwt(jwt) {
    this.updateValue({ jwt });
  }

}

export const authContext = new AuthContext();
