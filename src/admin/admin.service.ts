import db from "../db/db.js"

export const allUsersAdmin = () => {
    const users = db.query.usersTable.findMany({
        columns: {id:true,first_name:true,phone:true,status:true,role:true,created_at:true},
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
                columns:{
                    status:true,
                    claimed_at:true,
                    expires_at:true,
                },
                with:{
                    referee:{
                        columns:{id:true,first_name:true,phone:true,status:true}
                    }
                }
            },
            referralsUsed:{
                columns:{
                    status:true,
                    claimed_at:true,
                    expires_at:true
                },
                with:{
                    referrer:{
                        columns:{id:true,first_name:true,phone:true,created_at:true,status:true}
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