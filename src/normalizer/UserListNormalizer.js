class UsersListNormalizer {
  #users;
  #cursor;
  #limit;
  #direction;
  #sortBy;

  constructor(users, cursor, limit, direction, sortBy) {
    this.#users = users || [];
    this.#cursor = cursor || null;
    this.#limit = limit || 10;
    this.#direction = direction || 'next';
    this.#sortBy = sortBy;
  }

  normalize() {
    const normalizedUserList = this.#users.map((user) => ({
      id: user.id,
      username: user.username,
    }));

    const nextCursor = this.#users.length > 0 ? this.#users[this.#users.length - 1][this.#sortBy] : null;
    const prevCursor = this.#users.length > 0 ? this.#users[0][this.#sortBy] : null;

    return {
      users: normalizedUserList,
      cursor: this.#cursor,
      limit: this.#limit,
      direction: this.#direction,
      nextCursor,
      prevCursor,
    };
  }
}

export default UsersListNormalizer;
