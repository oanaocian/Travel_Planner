const db = require('../config/db');

exports.getProfile = async(req, res) => {
    try{
        //get user info
        const [users] = await db.query(
            'SELECT id, username, email, created_at FROM users WHERE id=?',
            [req.user.id]
        );
        if(users.length === 0)
            return res.status(404).json({ message: 'User not found' });

        //get trips count
        const [trips] = await db.query(
            'SELECT COUNT(*) as count FROM trips WHERE user_id=?',
            [req.user.id]
        );

        //get reviews count
        const [reviews] = await db.query(
            'SELECT COUNT(*) as count FROM reviews WHERE user_id=?',
            [req.user.id]
        );

        res.json({
            ...users[0],
            trips_count: trips[0].count,
            reviews_count: reviews[0].count
        });
    } catch(error) {
        res.status(500).json({ message: 'Server error', error});
    }
};

exports.updateUsername = async(req, res) => {
    const { username } = req.body;
    try{
        //check if username is already taken
        const [existing] = await db.query(
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [username, req.user.id]
        );
        if(existing.length > 0) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        await db.query(
            'UPDATE users SET username = ? WHERE id = ?',
            [username, req.user.id]
        );

        res.json({ message: 'Username updated successfully', username });
    } catch(error) {
        res.status(500).json({ message: 'Server error', error });
    }
};