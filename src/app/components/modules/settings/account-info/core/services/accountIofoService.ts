import { accountInfoClient } from "../api/accountInfoClient";
import { User } from "../models/accountIofoModel";

export const accountIofoService = {
    /**
     * Updates user's first name and last name
     */
    async updateProfileName(firstName: string, lastName: string, currentUser: User | null): Promise<{ success: boolean; updatedUser: User | null; error?: string }> {
        try {
            const response = await accountInfoClient.updatenameusers({
                first_name: firstName,
                last_name: lastName
            });

            if (response.error) {
                return { success: false, updatedUser: null, error: response.error.message || "Failed to update profile" };
            }

            const updatedUser = { ...currentUser, first_name: firstName, last_name: lastName } as User;
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("local-user-update"));

            return { success: true, updatedUser };
        } catch (error: any) {
            return { success: false, updatedUser: null, error: error.message || "An unexpected error occurred" };
        }
    },

    /**
     * Changes account password
     */
    async updatePassword(passwordData: any): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await accountInfoClient.updatepassword(passwordData);
            if (response.error) {
                return { success: false, error: response.error.message || "Failed to change password" };
            }
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || "Error updating password" };
        }
    },

    /**
     * Uploads the cropped profile avatar image file
     */
    async uploadProfilePicture(file: File, fallbackUrl: string | null, currentUser: User | null): Promise<{ success: boolean; updatedUser: User | null; error?: string }> {
        try {
            const response = await accountInfoClient.updateProfileImage(file);
            if (response.error) {
                return { success: false, updatedUser: null, error: response.error.message || "Failed to upload image" };
            }

            const updatedUser = { ...currentUser, image: response.data?.avatar_url || fallbackUrl } as User;
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("local-user-update"));

            return { success: true, updatedUser };
        } catch (error: any) {
            return { success: false, updatedUser: null, error: "Error uploading image" };
        }
    }
};