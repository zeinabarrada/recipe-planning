// src/app/models/user.model.ts

export class User {
    constructor(
        public email: string,
        public username: string,
        public password: string
    ) { }

    getUser(): User {
        return this;
    }

    getUserByEmail(email: string): User | null {
        if (this.email === email) {
            return this;
        }
        return null;
    }

    getUserByUsername(username: string): User | null {
        if (this.username === username) {
            return this;
        }
        return null;
    }
}
