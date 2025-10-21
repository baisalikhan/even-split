import { mutation } from "./_generated/server";

export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("User not found");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => 
                q.eq("tokenIdentifier", identity.tokenIdentifier)
        ).unique();
        if (user !== null) {
            if(user.name !== identity.name){
                await ctx.db.patch(user._id, {
                    name: identity.name,
                });
            }
            return user._id;
        }
        // create a new user
        const userId = await ctx.db.insert("users", {
            tokenIdentifier: identity.tokenIdentifier,
            name: identity.name ?? "Anonymous",
            email: identity.email,
            imageUrl: identity.pictureUrl,
        });
        return userId;
    }

})