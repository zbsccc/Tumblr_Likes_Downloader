const tumblr = require('tumblr.js')
const { key } = require('../config')
const client = tumblr.createClient(key)
const fs = require('fs')

const t = {
    getBlogLikes: async (blog, options) => {
        try{
            return new Promise(async (resolve, reject) => {
                client.blogLikes(blog, options, function (err, data) {
                    if(err){
                        reject([])
                    }
                    else{
                        resolve(data)
                    }
                });
            })
        }
        catch (e){
            console.log(e)
        }
    },
    getVideosList: async () => {
        try{
            return new Promise(async (resolve, reject) => {
                const file = 'public/files/data.txt';
                fs.readFile(file, 'utf8', async (err, data) => {

                    if(err){
                        reject(JSON.stringify(''))
                    }
                    else{
                        if(data.length > 0){
                            resolve(data)
                        }
                        else{
                            resolve(JSON.stringify(''))
                        }                    
                    }
                });
            })
        }
        catch (e){
            console.log(e)
        }
    }
}


module.exports = t
