require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

const PREFIX = '!';
const WELCOME_CHANNEL_ID = '1411812421814849536'; // Canal de welcome

// ==================== READY ====================
client.once('ready', async () => {
    console.log(`✅ Shadow Bot online como ${client.user.tag}`);
    
    // Status do bot
    client.user.setActivity('nas sombras 🖤', { type: 'WATCHING' });

    // Registra Slash Commands
    const commands = [
        new SlashCommandBuilder().setName('ping').setDescription('Responde com pong!'),
        new SlashCommandBuilder().setName('ajuda').setDescription('Mostra os comandos'),
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ Slash Commands registrados!');
    } catch (error) {
        console.error(error);
    }
});

// ==================== WELCOME ====================
client.on('guildMemberAdd', async member => {
    const welcomeChannel = await client.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);
    
    if (welcomeChannel) {
        const embed = new EmbedBuilder()
            .setColor(0x6b00ff)
            .setTitle('👋 Novo Membro Chegou!')
            .setDescription(`Bem-vindo(a) ao servidor, **${member.user.tag}**! 🖤\n\nEsperamos que você se divirta bastante por aqui!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setTimestamp();

        welcomeChannel.send({ embeds: [embed] });
    }
});

// ==================== COMANDOS COM PREFIXO ! ====================
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ajuda' || command === 'comandos') {
        const ajuda = `**🖤 Shadow Bot - Comandos**\n\n` +
            `**Moderação:**\n` +
            `\`!clear <número>\` - Apaga mensagens\n` +
            `\`!ban @user\` - Bane usuário\n` +
            `\`!kick @user\` - Expulsa usuário\n\n` +
            `**Diversão:**\n` +
            `\`!ping\` - Latência\n` +
            `\`!avatar\` - Seu avatar\n` +
            `\`!serverinfo\` - Info do servidor\n` +
            `\`!meme\` - Meme`;
        message.reply(ajuda);
    }

    // !ping
    if (command === 'ping') {
        message.reply(`🏓 Pong! ${Date.now() - message.createdTimestamp}ms`);
    }

    // !clear
    if (command === 'clear') {
        if (!args[0]) return message.reply('Use: `!clear 10`');
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply('Número entre 1 e 100!');
        
        await message.channel.bulkDelete(amount + 1, true);
        const msg = await message.channel.send(`✅ ${amount} mensagens apagadas!`);
        setTimeout(() => msg.delete(), 4000);
    }
});

// ==================== SITE (com PORT para hospedagem) ====================
const app = express();
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 Site rodando na porta ${PORT}`);
});

client.login(process.env.TOKEN);