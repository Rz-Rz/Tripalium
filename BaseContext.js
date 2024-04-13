export default class BaseContext {
    constructor(initialValue) {
        this._currentValue = initialValue;
        this._subscribers = [];
    }

    updateValue(newValue) {
      console.log('Updating context:', newValue);
        this._currentValue = newValue;
        this._subscribers.forEach(subscriber => {
          subscriber();
          console.log('Subscriber notified:', subscriber);
        });
    }

    subscribe(subscriber) {
      console.log('Subscribing to context:', subscriber);
        this._subscribers.push(subscriber);
      console.log('Current Subscribers:', this._subscribers);
        return () => {
            this._subscribers = this._subscribers.filter(sub => sub !== subscriber);
          console.log('Unsubscribing from context:', subscriber);
          console.log('Remaining Subscribers:', this._subscribers);
        };
    }

    get value() {
        return this._currentValue;
    }
}
