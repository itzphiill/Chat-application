//Keep track of users in a array
const users = []

const addUser = ({
    id,
    username,
    room
}) => {
    //Clean data, trim, remove spaces, and validate
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: ' Username and room are required'
        }

    }

    //Validation check for exsisting users
    //Return if user is in the same room try to join, username is unique
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate username
    if (existingUser) {
        return {
            error: 'Username already in use'
        }
    }

    //Store user
    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return {
        user
    }
}
const getUser = (id) => {
    return users.find((user) => user.id === id)
}
const getUsersRoom = (room) => {
    return users.filter((user) => user.room === room)
}
//-1 if we dont find a match 0+ if we find extract user remove
//filter keeps running
const userRemove = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

module.exports = {
    addUser,
    userRemove,
    getUser,
    getUsersRoom

}