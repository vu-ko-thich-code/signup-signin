

export async function authMe(req, res) {
    try {
        const user = req.user; // get from authMiddleware

        res.status(200).json({user});
    }
    catch(error) {
        console.error("Error in authMe", error);
        res.status(500).json({message: "Internal server error"});
    }
}