const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/locahost');

const express = require('express');
const { json } = require('express/lib/response');
const app = express();
app.use(express.json());
const cors = (req, res, next) => {
    const whitelist = [
        'http://localhost:4200'
    ];
    const origin = req.headers.origin;
    if (whitelist.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'token,Content-Type,Authorization,x-access-token');
    next();
}

app.use(cors);
const port = 3000;

app.post('/register', async (req, res) => {
    var user_name = req.body.name;
    var user_email = req.body.email;
    var user_password = req.body.password;
    res.send(await newUser(user_name, user_email, user_password));
})

app.post('/searchName', (req, res) => {
    var user_name = req.body.name;
    res.send(findWithName(user_name));
});

app.post('/searchEmail', async (req, res) => {
    var user_email = req.body.email;
    res.send(await findWithEmail(user_email));
});

app.post('/checkPassword', async (req, res) => {
    var user_password = req.body.password;
    res.send(await checkPassword(user_password));
});

app.post('/checkEmail', async (req, res) => {
    var user_email = req.body.email;
    res.send(await checkEmail(user_email));
});

app.post('/delete', (req, res) => {
    var user_email = req.body.email;
    res.send(deleteUser(user_email));
});

app.post('/update', async (req, res) => {
    var user_email = req.body.email;
    var user_newPassword = req.body.password;
    res.send(await updatePassowrdUser(user_email, user_newPassword));
});

app.post('/login', async (req, res) => {
    var user_email = req.body.email;
    var user_password = req.body.password;
    res.send(await login(user_email, user_password));
});

app.post('/changeName', async (req, res) => {
    var oldName = req.body.oldname;
    var newName = req.body.newname;
    res.send(await updateName(oldName, newName));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

const User = mongoose.model('users', {
    name: String,
    email: String,
    password: String
});

async function newUser(userName, userEmail, userPassword) {

    if ((userName != null && userName != "") && (userEmail != null && userEmail != "") && (userPassword != null) && (userPassword.trim().length > 7)) {
        if (await checkEmail(userEmail) == true) {
            const usuario = new User({
                name: userName,
                email: userEmail,
                password: userPassword
            });
            await usuario.save();
            return  {
                boolean: true,
                message: 'Registrado com sucesso'
            };
        } else {
            return {
                boolean: false,
                message: 'Email ja utilizado'
            };
        }
    } else {
        return {
            boolean: false,
            message: 'Falha ao cadastrar'
        }
    }
}

async function findWithEmail(userEmail) {
    const result = await User.findOne({ email: userEmail });
    console.log(result)
    return result;
}

// async function findWithName(userName) {
//     const result = await User.findOne({ name: userName }).exec();
//     return result;
// }

// async function checkPassword(userPassword) {
//     if (userPassword != null && userPassword.trim().length > 0) {
//         const result = await User.findOne({ password: userPassword }).exec();
//         if (result != null) {
//             console.log('senha ja utilizada');
//             return false;
//         } else {
//             console.log('senha disponivel');
//             return true;
//         }
//     } else {
//         console.log('senha invalida');
//         return false;
//     }
// }

async function updateName(oldName, newName){
    const result = await User.findOne({ name: newName }).exec();
    if (result == null) {
        const teste = await User.updateOne({ name: oldName }, { name: newName });
        return {
            boolean: true,
            message: 'Nome trocado com sucesso'
        }
    } else {
        return {
            boolean: false,
            message: 'Falha ao alterar nome'
        }
    }
}

async function checkEmail(userEmail) {
    const result = await User.findOne({ email: userEmail }).exec();
    if (result != null) {
        console.log('email ja utilizado');
        return false;
    } else {
        console.log('email valido');
        return true;
    }
}

async function updatePassowrdUser(userEmail, newPassword) {
    const user = await findWithEmail(userEmail);
    if ((user != null) && (newPassword.trim().length > 7)) {
        await User.updateOne({ email: userEmail }, { password: newPassword });
        return {
            boolean: true,
            message: 'Senha atualizada com sucesso'
        };
    } else {
        return {
            boolean: false,
            message: 'Falha ao cadastrar'
        }
    }
}

async function deleteUser(userEmail) {
    if (await findWithEmail(userEmail) != null) {
        await User.findOneAndDelete({ email: userEmail });
        console.log("user deletado!");
    } else {
        console.log("email incorreto!");
    }
}

async function login(email, password) {
    const user = await findWithEmail(email);
    if ((user != null) && (user.password == password)) {
        return true;
    } else {
        return false;
    }
}