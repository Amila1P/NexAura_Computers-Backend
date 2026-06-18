import jwt from "jsonwebtoken";

export default function authenticateUser(req, res, next){
        
        const header = req.header("Authorization")

        if(header != null){

            const token = header.replace("Bearer ", "")

            jwt.verify(token, "i-computer-secret-key",
                (error, decoded)=>{

                    console.log(decoded)

                    if(decoded == null){
                        res.json(
                            {
                                message : "Invalid token Please Login Again"
                            }
                        )
                    }else {
                        req.user = decoded
                        next()
                    }

                }
            )

        }else{
            next()
        }
}  