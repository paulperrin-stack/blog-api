let users = {
    1: { id: '1', title: 'First Post', content: 'Hello!', userId: '1', published: true },
    2: { id: '2', title: 'Draft', content: 'WIP', userId: '1', published: false},
};

let comments = {
    1: { id: '1', text: 'Great post!', postId: '1', userId: '2' },
};

module.exports = { users, posts, comments };