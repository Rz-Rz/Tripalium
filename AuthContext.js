class AuthContext {
  constructor() {
    this._currentValue = { jwt: null };
    this._subscribers = [];
  }

  // Method to update the JWT and notify components
  setJwt(jwt) {
    this._currentValue.jwt = jwt;
    this._subscribers.forEach(subscriber => subscriber());
  }

  // Subscription method for useContext
  subscribe(subscriber) {
    this._subscribers.push(subscriber);
    // Return a method for unsubscribing to prevent memory leaks
    return () => {
      this._subscribers = this._subscribers.filter(sub => sub !== subscriber);
    };
  }

  get value() {
    return this._currentValue;
  }
}


export const authContext = new AuthContext();
