
 //==========================================
 // Máscara automática do WhatsApp
 //==========================================

const campoWhatsapp = document.getElementById('tutor-whatsapp');

if (campoWhatsapp) {

    campoWhatsapp.addEventListener('input', function () {

        let numero = this.value.replace(/\D/g, '');

        numero = numero.substring(0, 11);

        if (numero.length > 10) {

            numero = numero.replace(
                /^(\d{2})(\d{5})(\d{4})$/,
                '($1) $2-$3'
            );

        } else if (numero.length > 6) {

            numero = numero.replace(
                /^(\d{2})(\d{4})(\d{0,4})$/,
                '($1) $2-$3'
            );

        } else if (numero.length > 2) {

            numero = numero.replace(
                /^(\d{2})(\d{0,5})$/,
                '($1) $2'
            );

        } else if (numero.length > 0) {

            numero = '(' + numero;

        }

        this.value = numero;

    });

}


//==========================================
// Validação do campo de data
//==========================================

const campoData = document.getElementById('data');

const campoHorario = document.getElementById('horario');


function obterDataLocal() {

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(hoje.getMonth() + 1).padStart(2, '0');

    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;

}


if (campoData) {

    campoData.min = obterDataLocal();

    campoData.addEventListener('change', async function () {

        if (!this.value) return;

        const [ano, mes, dia] = this.value.split('-').map(Number);

        const dataSelecionada = new Date(ano, mes - 1, dia);

        const diaSemana = dataSelecionada.getDay();


        // Impedir datas passadas
        if (this.value < obterDataLocal()) {

            alert('Não é possível selecionar uma data passada.');

            this.value = '';

            campoHorario.value = '';

            return;

        }


        // Impedir sábados e domingos
        if (diaSemana === 0 || diaSemana === 6) {

            alert(
                'Por favor, selecione uma data de segunda a sexta-feira.'
            );

            this.value = '';

            campoHorario.value = '';

            return;

        }


        campoHorario.value = '';

        await atualizarHorariosDisponiveis();

    });

}


//==========================================
// Firebase - Importações
//==========================================

import {

    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    where,
    doc,
    runTransaction

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


//==========================================
// Consultar horários disponíveis
//==========================================

let consultaAtual = 0;


async function atualizarHorariosDisponiveis() {

    if (!campoData || !campoHorario) return;

    const dataSelecionada = campoData.value;

    const db = window.firebaseDB;

    if (!dataSelecionada || !db) return;


    const numeroConsulta = ++consultaAtual;


    // Bloquear select durante consulta
    campoHorario.disabled = true;


    try {

        // Restaurar horários
        Array.from(campoHorario.options).forEach(opcao => {

            if (!opcao.value) return;

            opcao.disabled = false;

            opcao.textContent = opcao.value;

        });


        // Consultar somente horários reservados
        const consultaReservas = query(

            collection(db, 'horarios_reservados'),

            where('data', '==', dataSelecionada)

        );


        const resultadoReservas = await getDocs(
            consultaReservas
        );


        // Ignorar consultas antigas
        if (

            numeroConsulta !== consultaAtual ||

            campoData.value !== dataSelecionada

        ) {

            return;

        }


        // Armazenar horários ocupados
        const horariosOcupados = new Set();


        resultadoReservas.forEach(documento => {

            horariosOcupados.add(
                documento.data().horario
            );

        });


        // Atualizar opções do select
        Array.from(campoHorario.options).forEach(opcao => {

            if (!opcao.value) return;

            const ocupado = horariosOcupados.has(opcao.value);

            opcao.disabled = ocupado;

            if (ocupado) {

                opcao.textContent =
                    opcao.value + ' - Indisponível';

            } else {

                opcao.textContent = opcao.value;

            }

        });


        // Limpar horário caso esteja ocupado
        if (horariosOcupados.has(campoHorario.value)) {

            campoHorario.value = '';

        }


        campoHorario.disabled = false;


    } catch (erro) {

        console.error(
            'Erro ao consultar horários:',
            erro
        );


        if (numeroConsulta === consultaAtual) {

            campoHorario.disabled = true;

            alert(
                'Não foi possível consultar os horários disponíveis.\n\n' +
                'Verifique sua conexão e as regras do Firebase.'
            );

        }

    }

}


//==========================================
// Firebase - Formulário de Agendamento
//==========================================

const formularioAgendamento = document.querySelector(
    '#agendamento form'
);


if (formularioAgendamento) {

    formularioAgendamento.addEventListener('submit', async (event) => {

        event.preventDefault();


        const db = window.firebaseDB;


        // Verificar Firebase
        if (!db) {

            alert(
                'Erro: o banco de dados não foi conectado.'
            );

            return;

        }


        //==========================================
        // Coletar WhatsApp
        //==========================================

        const numeroWhatsapp = campoWhatsapp.value.replace(/\D/g, '');


        // Validar WhatsApp
        if (

            numeroWhatsapp.length !== 10 &&

            numeroWhatsapp.length !== 11

        ) {

            alert(
                'Informe um número de WhatsApp válido com DDD.'
            );

            campoWhatsapp.focus();

            return;

        }


        //==========================================
        // Coletar dados do formulário
        //==========================================

        const dados = {

            petNome: document.getElementById('pet-nome').value.trim(),

            especie: document.getElementById('pet-especie').value,

            raca: document.getElementById('pet-raca').value.trim(),

            idade: document.getElementById('pet-idade').value.trim(),

            tutorNome: document.getElementById('tutor-nome').value.trim(),

            tutorWhatsapp: numeroWhatsapp,

            servico: document.getElementById('servico').value,

            data: campoData.value,

            horario: campoHorario.value,

            observacoes: document.getElementById('observacoes').value.trim(),

            criadoEm: serverTimestamp()

        };


        //==========================================
        // Validar data e horário
        //==========================================

        if (!dados.data || !dados.horario) {

            alert(
                'Selecione uma data e um horário.'
            );

            return;

        }


        const [ano, mes, dia] = dados.data.split('-').map(Number);

        const dataVerificada = new Date(ano, mes - 1, dia);


        if (

            dados.data < obterDataLocal() ||

            dataVerificada.getDay() === 0 ||

            dataVerificada.getDay() === 6

        ) {

            alert(
                'Selecione uma data válida de segunda a sexta-feira.'
            );

            return;

        }


        //==========================================
        // Criar referências da reserva
        //==========================================

        const identificadorHorario =

            `${dados.data}_${dados.horario.replace(':', '-')}`;


        const referenciaAgendamento = doc(
            collection(db, 'agendamentos')
        );


        const referenciaHorario = doc(
            db,
            'horarios_reservados',
            identificadorHorario
        );


        //==========================================
        // Reservar horário e salvar agendamento
        //==========================================

        try {

            await runTransaction(db, async (transacao) => {


                // Verificar se o horário já está reservado
                const reservaExistente = await transacao.get(
                    referenciaHorario
                );


                if (reservaExistente.exists()) {

                    throw new Error('HORARIO_OCUPADO');

                }


                // Salvar agendamento
                transacao.set(
                    referenciaAgendamento,
                    dados
                );


                // Criar reserva do horário
                transacao.set(
                    referenciaHorario,
                    {

                        data: dados.data,

                        horario: dados.horario,

                        agendamentoId: referenciaAgendamento.id,

                        criadoEm: serverTimestamp()

                    }

                );

            });


            //==========================================
            // Sucesso
            //==========================================

            console.log(
                'Agendamento salvo:',
                referenciaAgendamento.id
            );


            alert(

                'Agendamento realizado com sucesso!' +

                '\n\nNúmero do agendamento: ' +

                referenciaAgendamento.id

            );


            // Limpar formulário
            formularioAgendamento.reset();


            // Invalidar consultas anteriores
            consultaAtual++;


            // Restaurar select
            Array.from(campoHorario.options).forEach(opcao => {

                if (!opcao.value) return;

                opcao.disabled = false;

                opcao.textContent = opcao.value;

            });


            campoHorario.disabled = false;


        } catch (erro) {


            console.error(
                'Erro ao salvar agendamento:',
                erro
            );


            if (erro.message === 'HORARIO_OCUPADO') {

                alert(

                    'Este horário acabou de ser reservado por outra pessoa!\n\n' +

                    'Por favor, escolha outro horário.'

                );


                await atualizarHorariosDisponiveis();

                campoHorario.value = '';


            } else {

                alert(

                    'Não foi possível realizar o agendamento.\n\n' +

                    'Verifique sua conexão e as permissões do Firebase.'

                );

            }

        }

    });

}


//==========================================
// Firebase - Formulário de Mensagem
//==========================================

const formularioMensagem = document.querySelector(
    '#contato form'
);


if (formularioMensagem) {

    formularioMensagem.addEventListener('submit', async (event) => {

        event.preventDefault();


        const db = window.firebaseDB;


        if (!db) {

            alert(
                'Erro: o banco de dados não foi conectado.'
            );

            return;

        }


        // Coletar dados
        const dados = {

            nome: document.getElementById('c-nome').value.trim(),

            contato: document.getElementById('c-contato').value.trim(),

            mensagem: document.getElementById('c-mensagem').value.trim(),

            status: 'pendente',

            criadoEm: serverTimestamp()

        };


        // Validar campos
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


        // Salvar mensagem
        try {

            const documento = await addDoc(

                collection(db, 'mensagens'),

                dados

            );


            console.log(
                'Mensagem salva:',
                documento.id
            );


            alert(
                'Mensagem enviada com sucesso!'
            );


            formularioMensagem.reset();


        } catch (erro) {

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
