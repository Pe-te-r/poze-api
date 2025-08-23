export type registerType = {
    first_name: string;
    last_name?: string;
    phone: string;
    password: string;
    avatar_url?: string;
    role?: 'customer' | 'admin';    
}