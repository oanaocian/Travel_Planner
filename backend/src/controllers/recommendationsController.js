const db = require('../config/db');

exports.getRecommendations = async (req, res) => {
    try {
        //verificam daca userul are favorite
        const [myFavourites] = await db.query(
            'SELECT destination_id FROM favourites WHERE user_id=?',
            [req.user.id]
        );

        //cazul 1 - utilizator nou, nu are favorite
        //recomandam cele mai populare destinatii
        if (myFavourites.length === 0) {
            console.log('No favourites found, returning popular');//
            const [popular] = await db.query(
                `SELECT destinations.*, COUNT(favourites.id) as score
                FROM destinations
                LEFT JOIN favourites ON destinations.id = favourites.destination_id
                GROUP BY destinations.id
                ORDER BY score DESC
                LIMIT 4`
            );
            return res.json({ type: 'popular', recommendations: popular });
        }

        //cazul 2 - utilizator deja existent
        //recomandam destinatii apreciate de utilizatori cu gusturi similare
        const [collaborative] = await db.query(
            `SELECT destinations.*, COUNT(*) as score
            FROM favourites
            JOIN destinations ON favourites.destination_id = destinations.id
            WHERE favourites.user_id IN (
                SELECT DISTINCT user_id FROM favourites
                WHERE destination_id IN (
                    SELECT destination_id FROM favourites WHERE user_id = ?
                )
                AND user_id != ?
            )
            AND destinations.id NOT IN (
                SELECT destination_id FROM favourites WHERE user_id = ?
            )
            GROUP BY destinations.id
            ORDER BY score DESC
            LIMIT 4`,
            [req.user.id, req.user.id, req.user.id]
        );

        //if collaborative filtering found results, return them
        if (collaborative.length > 0) {
            return res.json({ type: 'collaborative', recommendations: collaborative });
        }

        //daca nu s-au gasit utilizatori similari, recomanda din nou cele mai populare
        const [popular] = await db.query(
            `SELECT destinations.*, COUNT(favourites.id) as score
            FROM destinations
            LEFT JOIN favourites ON destinations.id = favourites.destination_id
            WHERE destinations.id NOT IN (
                SELECT destination_id FROM favourites WHERE user_id = ?
            )
            GROUP BY destinations.id
            ORDER BY score DESC
            LIMIT 4`,
            [req.user.id]
        );
        return res.json({type: 'popular', recommendations: popular});
    } catch(error) {
        res.status(500).json({message: 'Server error', error});
    }
};
//daca nu s-au gasit utilizatori similari, recomanda din nou cele mai populare