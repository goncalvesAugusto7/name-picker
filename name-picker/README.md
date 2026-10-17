# 🎲 Sorteador de Nomes

Uma aplicação web desenvolvida com **React, Vite e Tailwind CSS** para realizar sorteios de nomes de forma simples, rápida e intuitiva. O projeto também permite organizar participantes em grupos, duplas e trios, sendo útil para dinâmicas, brincadeiras, atividades acadêmicas e outras situações que exigem a seleção aleatória de pessoas.

## ✨ Funcionalidades

- **Cadastro de participantes:** adicione nomes à lista para participar dos sorteios.
- **Gerenciamento da lista:** visualize os participantes cadastrados, remova nomes e limpe a lista quando necessário.
- **Sorteio aleatório:** selecione um participante aleatoriamente.
- **Sorteio com repetição:** permite que um mesmo participante seja sorteado mais de uma vez.
- **Sorteio sem repetição:** evita que um participante seja sorteado novamente até que o ciclo seja reiniciado.
- **Efeitos sonoros:** reprodução de sons durante o sorteio e ao anunciar o resultado.
- **Anúncio por voz:** o nome sorteado pode ser anunciado por voz.
- **Organização em grupos:** distribua os participantes em grupos, duplas e trios quando necessário.
- **Interface responsiva:** layout adaptável a diferentes tamanhos de tela.
- **Instalação como aplicativo:** suporte à instalação como PWA (Progressive Web App) em navegadores compatíveis.

## 🛠️ Tecnologias utilizadas

- [React](https://react.dev/) — construção da interface.
- [Vite](https://vite.dev/) — ambiente de desenvolvimento e ferramenta de build.
- [Tailwind CSS](https://tailwindcss.com/) — estilização da aplicação.
- [Lucide React](https://lucide.dev/) — ícones da interface.
- [Piper / Vozz](https://www.npmjs.com/package/@pedrobef/vozz) — síntese de voz para anunciar os resultados.
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) — suporte a funcionalidades de Progressive Web App, caso esteja configurado no projeto.

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) — preferencialmente uma versão LTS compatível com as dependências do projeto.
- npm, incluído na instalação do Node.js.

## 🚀 Como clonar e executar

### 1. Clone o repositório

Abra o terminal e execute:

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
```

Substitua a URL acima pelo endereço real do repositório.

### 2. Entre na pasta do projeto

```bash
cd SEU-REPOSITORIO
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local da aplicação. Geralmente, é:

```text
http://localhost:5173
```

Abra esse endereço no navegador para utilizar o sorteador.

### 5. Gere a versão de produção

Para verificar se a aplicação pode ser compilada para produção, execute:

```bash
npm run build
```

Os arquivos gerados ficarão no diretório `dist/`.

Se quiser testar a versão compilada localmente, execute:

```bash
npm run preview
```

## 📱 Instalação como aplicativo

Em navegadores compatíveis, o sorteador pode ser instalado no computador ou celular para oferecer uma experiência semelhante à de um aplicativo.

1. Acesse a aplicação pelo navegador.
2. Procure o botão **Instalar aplicativo** ou a opção de instalação no menu do navegador.
3. Siga as instruções apresentadas.

A disponibilidade da instalação depende do navegador, do dispositivo e da configuração PWA do projeto. Em geral, a publicação deve utilizar HTTPS.

## 📂 Estrutura básica do projeto

A estrutura pode variar conforme a organização atual do repositório. Em uma configuração típica de React com Vite, ela se parece com esta:

```text
sorteador-de-nomes/
├── public/
│   └── sounds/
│       ├── drum-roll.mp3
│       └── mission-complete.mp3
├── src/
│   ├── components/
│   │   └── InstallButton.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🌐 Publicação

O projeto pode ser publicado em plataformas de hospedagem de aplicações web, como a [Vercel](https://vercel.com/).

Em uma configuração padrão do Vite, utilize:

- **Comando de build:** `npm run build`
- **Diretório de saída:** `dist`

Se o repositório estiver conectado à Vercel, novos deploys poderão ser realizados automaticamente após o envio de alterações ao GitHub, conforme a configuração da integração.

## 🤝 Contribuições

Contribuições são bem-vindas! Você pode sugerir melhorias, reportar problemas ou propor novas funcionalidades por meio de *issues* e *pull requests* no repositório.
