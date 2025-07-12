const apiKeyInput = document.getElementById('api-key');
const selectGameInput = document.getElementById('game-select');
const questionInput = document.getElementById('question');
const askButton = document.getElementById('ask-button');
const form = document.getElementById('form');
const aiResponse = document.getElementById('ai-response');

// Função que faz a formatação da resposta da API usando o showdown.js
const markdownToHTML = (text) =>{
    const converter = new showdown.Converter(); // Cria um objeto de converter
    return converter.makeHtml(text);
}

const askToIa = async (question , game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const pergunta =  `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}
        
        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas 
       
        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não tem relação com o jogo'.
        - Considere a data atual ${new Date().toLocaleDateString()}.
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para uma resposta coerente.
        - Nunca responda itens que você não tenha certeza de que existe no patch atual.
        
        ## Resposta
        - Economize na resposta, seja direto e responda em no máximo 500 caracteres.
        - Respondendo em markdown.
        - Responda apenas o que usuário pediu, sem saudação ou despedida.
        
        
        ## Exemplo de resposta
        pergunta do usuário: Melhor build para Yasuo mid
        resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui. \n\n**Runas:**\n\n exemplo de runas\n\n
        
        ___
        
        Aqui está a pergunta do usuário: ${question}
        
    `

    // Formato da API rest
    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    // Chamada API
    const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json();
    console.log({data})
    return data.candidates[0].content.parts[0].text;
}

const sendForm = async (event) => {
    event.preventDefault() // Impede que a página atualize quando o formulario for submetido
    const apiKey = apiKeyInput.value;
    const game = selectGameInput.value;
    const question = questionInput.value;

    if(apiKey === '' || game === '' || question === '') {
        alert('Prencha todos os campos!');
        return;
    }

    askButton.disabled = true; // Desabilita o botão
    askButton.textContent = 'Perguntando...';
    askButton.classList.add('loading');

    try{
        const text = await askToIa(question, game, apiKey);
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
        aiResponse.classList.remove('hidden');
    }catch(error){
        console.log('Erro: ' + error);
    }finally {
        askButton.disabled = false; // Habilita o botão
        askButton.textContent = 'Perguntar';
        askButton.classList.remove('loading');
    }

}

form.addEventListener('submit', sendForm);

