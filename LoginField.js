// LoginField.js
// Abstract class for field collections

export class LoginField {
  firstName;
  lastName;
  student;
  studentEmail;
  studentId;
  section;
  instructor;
  instructorEmail;
  sapLogin;
  sapPassword;
  created;

  // Iterator for field keys in order
  [Symbol.iterator]() {
    const keys = Object.keys(this);
    let i = 0;
    return {
      next: () => {
        if (i < keys.length) {
          const key = keys[i++];
          return { value: [key, this[key]], done: false };
        } else {
          return { done: true };
        }
      },
    };
  }
  // Get default headers (field keys)
  get headers() {
    return Object.keys(this);
  }
}
