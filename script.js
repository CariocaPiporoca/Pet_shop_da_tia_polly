//==========================================
//  Validação do campo de data do agendamento
//========================================== 

const campoData = document.getElementById('data');

if (campoData) {

    
    function obterDataLocal() {
        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');

        return `${ano}-${mes}-${dia}`;
    }

    
    campoData.min = obterDataLocal();

    
    campoData.addEventListener('change', function () {

        if (!this.value) return;

        
        const [ano, mes, dia] = this.value.split('-').map(Number);

        const dataSelecionada = new Date(ano, mes - 1, dia);
        const diaSemana = dataSelecionada.getDay();

        
        if (diaSemana === 0 || diaSemana === 6) {

            alert(
                'Por favor, selecione uma data de segunda a sexta-feira.'
            );

            this.value = '';
        }
    });

}



// ==========================================
// Firebase - Formulário de Agendamento
// ==========================================


import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// Formulário de Agendamento
// ==========================================

const formularioAgendamento = document.querySelector(
    '#agendamento form'
);



if (formularioAgendamento) {

    formularioAgendamento.addEventListener('submit', async (event) => {

        event.preventDefault();


        // ==========================================
        // Verificar conexão com o Firebase
        // ==========================================

        const db = window.firebaseDB;

        if (!db) {

            console.error('Firebase não foi inicializado.');

            alert(
                'Erro: o banco de dados não foi conectado.\n\n' +
                'Verifique a configuração do Firebase.'
            );

            return;
        }


        // ==========================================
        // Coletar Valores do Formulário
        // ==========================================

        const dados = {

            petNome: document
                .getElementById('pet-nome')
                .value
                .trim(),

            especie: document
                .getElementById('pet-especie')
                .value,

            raca: document
                .getElementById('pet-raca')
                .value
                .trim(),

            idade: document
                .getElementById('pet-idade')
                .value
                .trim(),

            tutorNome: document
                .getElementById('tutor-nome')
                .value
                .trim(),

            tutorWhatsapp: document
                .getElementById('tutor-whatsapp')
                .value
                .trim(),

            servico: document
                .getElementById('servico')
                .value,

            data: document
                .getElementById('data')
                .value,

            horario: document
                .getElementById('horario')
                .value,

            observacoes: document
                .getElementById('observacoes')
                .value
                .trim(),

            criadoEm: serverTimestamp()

        };


        // ==========================================
        // Enviar dados para o Firebase
        // ==========================================

        try {

            const documento = await addDoc(
                collection(db, 'agendamentos'),
                dados
            );


            // ==========================================
            // Sucesso
            // ==========================================

            console.log(
                'Agendamento salvo com sucesso!',
                documento.id
            );


            alert(
                'Agendamento realizado com sucesso!' +
                '\n\nNúmero do agendamento: ' +
                documento.id
            );

            //==========================================
            // Limpa o formulário
            //==========================================
            
            formularioAgendamento.reset();


        } catch (erro) {

            // ==========================================
            // Erro
            // ==========================================

            console.error(
                'Erro ao salvar agendamento:',
                erro
            );


            alert(
                'Não foi possível realizar o agendamento.\n\n' +
                'Verifique sua conexão com o Firebase.'
            );

        }

    });

}


// ==========================================
// Firebase - Formulário de Mensagem
// ==========================================

const formularioMensagem = document.querySelector(
    '#contato form'
);

if (formularioMensagem) {

    formularioMensagem.addEventListener('submit', async (event) => {

        event.preventDefault();

        // ==========================================
        // Verificar conexão com o Firebase
        // ==========================================

        const db = window.firebaseDB;

        if (!db) {

            console.error('Firebase não foi inicializado.');

            alert(
                'Erro: o banco de dados não foi conectado.\n\n' +
                'Verifique a configuração do Firebase.'
            );

            return;
        }

        // ==========================================
        // Coletar valores do formulário
        // ==========================================

        const dados = {

            nome: document
                .getElementById('c-nome')
                .value
                .trim(),

            contato: document
                .getElementById('c-contato')
                .value
                .trim(),

            mensagem: document
                .getElementById('c-mensagem')
                .value
                .trim(),

            status: 'pendente',

            criadoEm: serverTimestamp()

        };

        // ==========================================
        // Verificar campos obrigatórios
        // ==========================================

        if (
            !dados.nome ||
            !dados.contato ||
            !dados.mensagem
        ) {

            alert(
                'Preencha todos os campos antes de enviar.'
            );

            return;
        }

        // ==========================================
        // Enviar dados para o Firebase
        // ==========================================

        try {

            const documento = await addDoc(
                collection(db, 'mensagens'),
                dados
            );

            // ==========================================
            // Sucesso
            // ==========================================

            console.log(
                'Mensagem salva com sucesso!',
                documento.id
            );

            alert(
                'Mensagem enviada com sucesso!'
            );

            // ==========================================
            // Limpar formulário
            // ==========================================

            formularioMensagem.reset();

        } catch (erro) {

            // ==========================================
            // Erro
            // ==========================================

            console.error(
                'Erro ao salvar mensagem:',
                erro
            );

            alert(
                'Não foi possível enviar a mensagem.\n\n' +
                'Verifique sua conexão com o Firebase.'
            );

        }

    });

}
