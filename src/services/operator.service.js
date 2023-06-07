const bcrypt = require("bcrypt");
const {User} = require("../models");
const fs = require('fs')
const path = require('path')
const {request, response} = require("express");

async function addOperator(request, response) {
    try {
        const {name, email, no_hp, password, address, gender} = request.body
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
        const {thumbnail, ktp} = request.files
        if(!thumbnail || !ktp) {
            return response.status(422).json({
                status: 422,
                error: [
                    '"thumbnail" required',
                    '"ktp" required'
                ]
            })
        }
        const emailExist = await User.findOne({where: {email}})
        if(emailExist) return response.status(400).json({
            status: 400,
            message: 'User dengan email ini sudah ada'
        })
        const user = await User.create({
            name,
            email,
            username: 'operator' + Math.round(Math.random() * 1E9),
            no_hp,
            password: hashedPassword,
            type: 'operator',
            isaktif: true,
            address,
            thumbnail: thumbnail[0].filename,
            ktp: ktp[0].filename,
            gender
        }, {returning: true})
        response.status(201).json({
            status: 201,
            message: 'Berhasil tambah operator'
        })
    } catch (e) {
        console.log(e)
        response.status(500).json({
            status: 500,
            message: 'Internal Server Error'
        })
    }
}

async function detailOperator(request, response) {

    const operator = await getOperatorById(request.params.id)
    if (!operator) return response.status(404).json({
        status: 404,
        message: "Operator tidak ditemukan"
    })
    response.status(200).json({
        status: 200,
        data: {
            user_id: operator.user_id,
            name: operator.name,
            username: operator.username,
            is_aktif: operator.isaktif,
            no_hp: operator.no_hp,
            alamat: operator.alamat,
            email: operator.email,
            thumbnail: process.env.APP_URL + '/' + operator.thumbnail,
            ktp: process.env.APP_URL + '/' + operator.ktp,
            gender: operator.gender
        }
    })
}

async function setOperatorStatus(request, response) {
    const operator = await getOperatorById(request.params.id)
    if (!operator) return response.status(404).json({
        status: 404,
        message: "Operator tidak ditemukan"
    })
    operator.update({isaktif: !operator.isaktif})
    return response.status(200).json({
        status: 200,
        message: "Berhasil update status operator"
    })
}


async function updateOperator(request, response) {
    try {
        const operator = await getOperatorById(request.params.id)
        const {thumbnail, ktp} = request.files
        const {name, no_hp, address, gender} = request.body
        if (!operator) return response.status(404).json({
            status: 404,
            message: "Operator tidak ditemukan"
        })
        const updatedData = {
            name,
            no_hp,
            gender,
            address,
        }
        if(request.files.length !== 0) {
            if(thumbnail) {
                fs.unlink(path.join(__dirname, '../../public/' + operator.ktp), (err) => {
                    if(!err) {
                        console.log('File Deleted')
                    }
                })
                updatedData['thumbnail'] = thumbnail[0].filename
            }
            if(ktp) {
                fs.unlink(path.join(__dirname, '../../public/' + operator.ktp), (err) => {
                    if(!err) {
                        console.log('File Deleted')
                    }
                })
                updatedData['ktp'] = ktp[0].filename
            }
        }
        await operator.update(updatedData)
        response.status(200).json({
            status: 200,
            message: 'Berhasil update operator'
        })
    } catch (err) {
        console.log(err)
        response.status(500).json({
            status: 500,
            message: 'Internal server error'
        })
    }
}

async function getOperator(request, response) {
    const operators = await User.findAll({
        where: {
            isaktif: request.query.type === 'active',
            type: 'operator'
        },
        order: [
            ['name', 'ASC']
        ]
    })
    if(request.query.type === 'active') {
        console.log(operators)
        return response.status(200).json({
            status: 200,
            data: operators.map(value => {
                return {
                    user_id: value.user_id,
                    name: value.name,
                    email: value.email,
                    username: value.username,
                    isaktif: value.isaktif,
                    no_hp: value.no_hp,
                    gender: value.gender,
                    thumbnail: process.env.APP_URL + "/" + value.thumbnail
                }
            })
        })
    } else {
        return response.status(200).json({
            status: 200,
            data: operators.map(value => {
                return {
                    name: value.name,
                    username: value.username,
                    no_hp: value.no_hp,
                    isaktif: value.isaktif
                }
            })
        })
    }
}

async function getOperatorById(id) {
    return await User.findOne({
        where: {
            user_id: id,
            type: 'operator'
        }
    });
}

module.exports = {addOperator, detailOperator, setOperatorStatus, updateOperator, getOperator}