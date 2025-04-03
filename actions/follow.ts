"use server";

import { followUser, unFollowUser } from "@/lib/follow-service";
import { revalidatePath } from "next/cache";


export const onFollow = async (id:string) => {
    try {

const folowedUser = await followUser(id);
revalidatePath(`/`);

if(folowedUser) {
    revalidatePath(`/${folowedUser.following.username}`)

};

return folowedUser;
    } catch (error) {
        throw new Error('Internal Error')
        
    }
}


export const unFollow = async (id:string) => {
    try {
        const unfollowUser = await unFollowUser(id);

        revalidatePath(`/`);

        if(unfollowUser) {
            revalidatePath(`/${unfollowUser.following.username}`)

        };

        return unfollowUser;
        
    } catch (error) {
        throw new Error('Internal Error')

        
    }
}