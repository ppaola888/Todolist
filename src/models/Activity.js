class Activity {
  #id;
  #name;
  #description;
  #dueDate;
  #status;
  #userId;
  constructor(activity) {
    this.#id = activity._id.toString();
    this.#name = activity.name;
    this.#description = activity.description;
    this.#dueDate = activity.dueDate;
    this.#status = activity.status;
    this.#userId = activity.userId;
  }
  get name() {
    return this.#name;
  }
  get description() {
    return this.#description;
  }
  get dueDate() {
    return this.#dueDate;
  }
  get status() {
    return this.#status;
  }
  get id() {
    return this.#id;
  }
  get userId() {
    return this.#userId;
  }
  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      description: this.#description,
      dueDate: this.#dueDate,
      status: this.#status,
      userId: this.#userId,
    };
  }
}

export default Activity;
