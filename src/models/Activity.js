class Activity {
  #id;
  #name;
  #description;
  #dueDate;
  #status;
  constructor(activity) {
    this.#id = activity._id.toString();
    this.#name = activity.name;
    this.#description = activity.description;
    this.#dueDate = activity.dueDate;
    this.#status = activity.status;
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
  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      description: this.#description,
      dueDate: this.#dueDate,
      status: this.#status,
    };
  }
}

export default Activity;
