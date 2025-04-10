class User {
  #id;
  #email;
  #password;
  #salt;
  #status;

  constructor(user) {
    this.#id = user._id.toString();
    this.#email = user.email;
    this.#password = user.password;
    this.#salt = user.salt;
    this.#status = user.status;
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

  toJSON() {
    return {
      id: this.#id,
      email: this.#email,
      password: this.#password,
      salt: this.#salt,
      status: this.#status,
    };
  }
}

export default User;
