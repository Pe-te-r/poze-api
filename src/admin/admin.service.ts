import db from "../db/db.js"

export const allUsersAdmin = () => {
    const users = db.query.usersTable.findMany({
        columns: {first_name:true,phone:true,created_at:true,id:true,status:true,role:true},
        orderBy: (users, { desc }) => [desc(users.created_at)],
        with:{
            auth:{
                columns:{
                    last_login:true,
                    locked_until:true,
                }
            },
            pin:{
                columns:{
                    pin_set:true,                    
                }
            },
            userReferral:{
                columns:{
                    referral_code:true,                    
                    total_referrals:true,
                    total_earnings:true,
                }
            },
            referralsMade:{
                with:{
                    referee:{
                        columns:{first_name:true,phone:true,created_at:true,id:true,status:true,role:true}
                    }
                }
            },
            referralsUsed:{
                with:{
                    referrer:{
                        columns:{first_name:true,phone:true,created_at:true,id:true,status:true,role:true}
                    }
                }
            },
        }
    })
    if (!users) {
        throw new Error('No users found')
    }
    return users
}