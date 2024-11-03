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

// Adiconando css
index.use('/css',express.static('./css'))

// Referenciar a pasta imagens
index.use('/imagens', express.static('./imagens'))

//Configuração do handlebars
index.engine('handlebars', engine({
    helpers: {
      // Função auxiliar para verificar igualdade
      condicionalIgualdade: function (parametro1, parametro2, options) {
        return parametro1 === parametro2 ? options.fn(this) : options.inverse(this);
      }
    }
  }));

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


// Rota Principal contendo o andamento
index.get('/:andamento', function(req, res){
    
    let sql = 'SELECT * FROM produtos'

    conexao.query(sql, function(erro, retorno){
        res.render('formulario', {produtos:retorno, andamento:req.params.andamento})
    })
})


// Rota de Cadastro
index.post('/cadastrar', function(req,res){
    try{
        let nome = req.body.nome
        let valor = req.body.valor
        let imagem = req.files.imagem.name

        //Validação do nome e valor do produto
        if(nome == '' || valor == '' || isNaN(valor)){
            res.redirect('/falhaCadastro')
        }else{

            let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ('${nome}', ${valor}, '${imagem}')`
    
            conexao.query(sql, function(erro, retorno){
                if(erro) throw erro
                req.files.imagem.mv(__dirname+'/imagens/'+req.files.imagem.name)
                console.log(retorno)
            })
        
            // Retorna para rota principal
            res.redirect('/cadastroEfetuado')
        }
    
    }catch(erro){
        res.redirect('/falhaCadastro')
    }

})


// Rota de remoção
index.get('/remover/:codigo&:imagem', function(req, res){
    
    //Tratamento de exceção
    try{
        let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`

        conexao.query(sql, function(erro, retorno){
            if(erro) throw erro

            fs.unlink(__dirname+'/imagens/'+req.params.imagem, (erro_inesperado)=>{
                console.log('Produto removido')
            })
        })

        // Redirecinando 
        res.redirect('/remocaoEfetuada')
    }catch(erro){
        res.redirect('falhaRemover')
    }
})
    

// Rota de altereção e edição

index.get('/formularioEditar/:codigo', function(req, res){
    
    let sql = `SELECT * FROM produtos WHERE codigo = ${req.params.codigo}`

    conexao.query(sql, function(erro, retorno){
        if(erro) throw erro

        res.render('formularioEditar',{produto:retorno[0]})
    })
})


// Rota para edição

index.post('/editar', function(req, res){

    let nome = req.body.nome
    let valor = req.body.valor
    let codigo = req.body.codigo
    let nomeImagem = req.body.nomeImagem
    
    // Validar nome e valor do produto
    if(nome == '' || valor == '' || isNaN(valor)){
        res.redirect('/falhaEdicao')
    }else{

        try{
            let imagem = req.files.imagem

            let sql = `UPDATE produtos SET nome = '${nome}', valor = ${valor}, imagem = '${imagem.name}' WHERE codigo = ${codigo} `
        

            // Executar SQL
            conexao.query(sql, function(erro, retorno){
                if(erro)throw erro


                //Remover imagem antiga
                fs.unlink(__dirname+'/imagens/'+nomeImagem, (erro_imagem)=>{
                    console.log('Falha ao remover a imagem')
                })

                // Cadastrar nova imagem
                imagem.mv(__dirname+'/imagens/'+imagem.name)
            })

        }catch(erro){

            let sql = `UPDATE produtos SET nome = '${nome}', valor = ${valor} WHERE codigo = ${codigo} `

            // Executar SQL
            conexao.query(sql, function (erro, retorno){
                if(erro)throw erro
            })

        }

        // Redirecionamento
        res.redirect('/edicaoEfetuada')  
    }

})


// Servidor
index.listen(8080)