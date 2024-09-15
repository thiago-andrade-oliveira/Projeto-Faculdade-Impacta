// Imports 
const express = require('express')
const mysql = require('mysql2')
const { engine } = require('express-handlebars')
const index = express();

// Adicionando bootstrap
index.use('/bootstrap', express.static('./node_modules/bootstrap/dist'))

//Configuração do handlebars
index.engine('handlebars', engine());
index.set('view engine', 'handlebars');
index.set('views', './views');

//Manipulação JSON
index.use(express.json())
index.use(express.urlencoded({extended:false}))

// Conexão
const conexao = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Pipoca1@',
    database:'projeto'
})

// Teste de Conexão
conexao.connect(function(erro){
    if(erro) throw erro
    console.log('conexão efetuada com sucesso')
})


// Rota Principal
index.get('/', function(req, res){
    res.render('formulario')
})

// Rota de Cadastro
index.post('/cadastrar', function(req,res){

    let nome = req.body.nome
    let valor = req.body.valor

    let sql = `INSERT INTO produtos (nome, valor) VALUES ('${nome}', ${valor})`

    conexao.query(sql, function(erro, funcionando){
        if(erro) throw erro
        console.log(funcionando)
    })

    // Retorna para rota principal
    res.redirect('/')
})

// Servidor
index.listen(8080)