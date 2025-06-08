class User {
  #id;
  #email;
  #password;
  #salt;
  #status;
  #username;

  constructor(user) {
    this.#id = user._id.toString();
    this.#email = user.email;
    this.#password = user.password;
    this.#salt = user.salt;
    this.#status = user.status;
    this.#username = user.username;
  }

  get id() {
    return this.#id;
  }
  get email() {
    return this.#email;
  }
  get password() {
    return this.#password;
  }
  get salt() {
    return this.#salt;
  }
  get status() {
    return this.#status;
  }

  get username() {
    return this.#username;
  }

  set username(username) {
    this.#username = username;
  }

  toJSON() {
    return {
      id: this.#id,
      email: this.#email,
      status: this.#status,
      username: this.#username,
    };
  }
}

export default User;
