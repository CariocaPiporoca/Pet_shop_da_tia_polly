const { autenticacao } = require("./firebase");
async function cadastrarUsuario(email, senha, nome) {
    const usuario = await autenticacao.createUser({
        email: email,
        password: senha,
        displayName: nome
    });

    return usuario;
}
module.exports = {
    cadastrarUsuario
};