// Imports 
const express = require('express')
const mysql = require('mysql2')
const { engine } = require('express-handlebars')
const index = express();
const fileupload = require('express-fileupload')
const fs = require('fs')

// Habilitando upload de arquivos
index.use(fileupload())

// Adicionando bootstrap
index.use('/bootstrap', express.static('./node_modules/bootstrap/dist'))

// Referenciar a pasta imagens
index.use('/imagens', express.static('./imagens'))

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
    
    let sql = 'SELECT * FROM produtos'

    conexao.query(sql, function(erro, retorno){
        res.render('formulario', {produtos:retorno})
    })
})


// Rota de Cadastro
index.post('/cadastrar', function(req,res){

    let nome = req.body.nome
    let valor = req.body.valor
    let imagem = req.files.imagem.name

    let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ('${nome}', ${valor}, '${imagem}')`



    conexao.query(sql, function(erro, retorno){
        if(erro) throw erro
        req.files.imagem.mv(__dirname+'/imagens/'+req.files.imagem.name)
        console.log(retorno)
    })

    // Retorna para rota principal
    res.redirect('/')
})

// Rota de remoção
index.get('/remover/:codigo&:imagem', function(req, res){
    
    let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`

    conexao.query(sql, function(erro, retorno){
        if(erro) throw erro

        fs.unlink(__dirname+'/imagens/'+req.params.imagem, (erro_inesperado)=>{
            console.log('Produto removido')
        })
    })

    // Redirecinando para rota proncipal
    res.redirect('/')
})
    


// Servidor
index.listen(8080)