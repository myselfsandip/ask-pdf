import bcrypt from "bcrypt";


export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}


export const hashPassword = async (password: string, SALT_ROUNDS = 12): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (value: string, hashedValue: string): Promise<boolean> => {
    return await bcrypt.compare(value, hashedValue);
};