const mogoose = require('mongoose')

const { DB_CON_STRING } = process.env

module.exports = () => {
    //mogoose.connect("mongodb://localhost/test")
    mogoose.connect("mongodb+srv://Akbar:123123123@cluster0.pjzvswh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        .then(() => console.log('DB Connection Successfull'))
        .catch(err => console.log(err.message))
}