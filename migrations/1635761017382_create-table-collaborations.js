/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('collaborations',{
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });

    //tambah constraint untuk relasi ke table songs dan playlist
    pgm.addConstraint('collaborations','fk_collaborations.playlist_id','FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');

    pgm.addConstraint('collaborations','fk_collaborations.user_id','FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = pgm => {
    pgm.dropTable('collaborations');
};