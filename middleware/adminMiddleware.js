// Middleware for authorization

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access Forbidden: Admin role required" });
    }
    next();
}

router.get('/admin/dashboard', authorizeAdmin, (req, res) => {

});

