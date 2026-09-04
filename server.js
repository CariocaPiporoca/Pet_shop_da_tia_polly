const express = require('express');
const path = require('path');

const db = require('./database');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

// ==========================================
// Página principal
// ==========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// Criar agendamento
// ==========================================

app.post('/api/agendamentos', async (req, res) => {

    try {

        const dados = req.body;

        // Verificar campos obrigatórios
        if (
            !dados.petNome ||
            !dados.especie ||
            !dados.tutorNome ||
            !dados.tutorWhatsapp ||
            !dados.servico ||
            !dados.data ||
            !dados.horario
        ) {

            return res.status(400).json({
                mensagem: 'Preencha todos os campos obrigatórios.'
            });

        }

        // Criar documento no Firestore
        const agendamento = await db.collection('agendamentos').add({

            petNome: dados.petNome,
            especie: dados.especie,
            raca: dados.raca || '',
            idade: dados.idade || '',

            tutorNome: dados.tutorNome,
            tutorWhatsapp: dados.tutorWhatsapp,

            servico: dados.servico,
            data: dados.data,
            horario: dados.horario,

            observacoes: dados.observacoes || '',

            status: 'pendente',

            criadoEm: new Date()
        });

        console.log('Novo agendamento:', agendamento.id);

        return res.status(201).json({

            mensagem: 'Agendamento realizado com sucesso!',

            agendamentoId: agendamento.id

        });

    } catch (erro) {

        console.error('Erro ao criar agendamento:', erro);

        return res.status(500).json({

            mensagem: 'Erro ao salvar o agendamento no Firebase.'

        });

    }

});

//===========================================
// Enviar mensagem
//===========================================

app.post('/api/mensagens', async (req, res) => {

    try {

        const dados = req.body;

        // Verificar campos obrigatórios
        if (
            !dados.nome ||
            !dados.contato ||
            !dados.mensagem
        ) {

            return res.status(400).json({
                mensagem: 'Preencha todos os campos obrigatórios.'
            });

        }

        // Criar documento no Firestore
        const mensagem = await db.collection('mensagens').add({

            nome: dados.nome,
            contato: dados.contato,
            mensagem: dados.mensagem,

            status: 'pendente',

            criadoEm: new Date()
        });

        console.log('Nova mensagem:', mensagem.id);

        return res.status(201).json({

            mensagem: 'Mensagem enviada com sucesso!',

            mensagemId: mensagem.id

        });

    } catch (erro) {

        console.error('Erro ao enviar mensagem:', erro);

        return res.status(500).json({

            mensagem: 'Erro ao salvar a mensagem no Firebase.'

        });

    }

});


// ==========================================
// Iniciar servidor
// ==========================================

app.listen(3000, () => {

    console.log('==============================');
    console.log('Servidor iniciado!');
    console.log('Acesse: http://localhost:3000');
    console.log('==============================');

});
