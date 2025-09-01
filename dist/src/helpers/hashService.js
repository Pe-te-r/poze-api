import * as bcrypt from 'bcrypt';
export class HashService {
    saltRounds;
    constructor(saltRounds = 12) {
        this.saltRounds = saltRounds;
    }
    /**
     * Hash a password or PIN
     */
    async hashData(data) {
        try {
            return await bcrypt.hash(data, this.saltRounds);
        }
        catch (error) {
            throw new Error(`Hashing failed: ${error.message}`);
        }
    }
    /**
     * Verify if the data matches the hash
     */
    async verifyData(data, hash) {
        try {
            return await bcrypt.compare(data, hash);
        }
        catch (error) {
            throw new Error(`Verification failed: ${error.message}`);
        }
    }
    /**
     * Hash a password with specific options
     */
    async hashPassword(password) {
        return this.hashData(password);
    }
    /**
     * Verify a password
     */
    async verifyPassword(password, hash) {
        return this.verifyData(password, hash);
    }
    /**
     * Hash a transaction PIN (with optional different salt rounds)
     */
    async hashPin(pin, pinSaltRounds = 10) {
        try {
            return await bcrypt.hash(pin, pinSaltRounds);
        }
        catch (error) {
            throw new Error(`PIN hashing failed: ${error.message}`);
        }
    }
    /**
     * Verify a transaction PIN
     */
    async verifyPin(pin, hash) {
        return this.verifyData(pin, hash);
    }
    /**
     * Generate a random numeric code (for confirmation codes, etc.)
     */
    generateRandomCode(length = 6) {
        const digits = '0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += digits[Math.floor(Math.random() * digits.length)];
        }
        return code;
    }
    /**
     * Check if a hash needs to be refreshed (uses older algorithm or fewer rounds)
     */
    async needsRefresh(hash, currentSaltRounds = this.saltRounds) {
        // Extract salt rounds from the hash
        const matches = hash.match(/^\$2[aby]?\$(\d+)\$/);
        if (!matches)
            return false;
        const usedSaltRounds = parseInt(matches[1], 10);
        return usedSaltRounds < currentSaltRounds;
    }
}
// Singleton instance for easy import
export const hashService = new HashService();
