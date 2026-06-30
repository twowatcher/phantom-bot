require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const express = require('express');
const app = express();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const PREFIX = '!';

// ==================== BOT INICIANDO ====================
client.once('ready', () => {
    console.log(`✅ PHANTOM Bot ONLINE! 👻`);
    client.user.setActivity('nas sombras 👻', { type: 'WATCHING' });
});

// ==================== COMANDOS ====================
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. PING
    if (command === 'ping') {
        message.reply(`🏓 Pong! Latência: ${Date.now() - message.createdTimestamp}ms`);
    }

    // 2. AVATAR
    if (command === 'avatar') {
        const usuario = message.mentions.users.first() || message.author;
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`📸 Avatar de ${usuario.username}`)
            .setImage(usuario.displayAvatarURL({ dynamic: true, size: 1024 }));
        message.reply({ embeds: [embed] });
    }

    // 3. SERVERINFO
    if (command === 'serverinfo') {
        const { guild } = message;
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`ℹ️ ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '🆔 ID', value: guild.id, inline: true },
                { name: '👑 Dono', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 Membros', value: `${guild.memberCount}`, inline: true },
                { name: '📅 Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
            );
        message.reply({ embeds: [embed] });
    }

    // 4. USERINFO
    if (command === 'userinfo') {
        const membro = message.mentions.members.first() || message.member;
        const embed = new EmbedBuilder()
            .setColor(0x00FFFF)
            .setTitle(`👤 ${membro.user.username}`)
            .setThumbnail(membro.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Tag', value: membro.user.tag, inline: true },
                { name: 'ID', value: membro.id, inline: true },
                { name: 'Entrou no Servidor', value: `<t:${Math.floor(membro.joinedTimestamp / 1000)}:R>`, inline: false },
                { name: 'Conta Criada', value: `<t:${Math.floor(membro.user.createdTimestamp / 1000)}:R>`, inline: false }
            );
        message.reply({ embeds: [embed] });
    }

    // 5. CLEAR
    if (command === 'clear' || command === 'limpar') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Você não tem permissão para limpar mensagens.');
        }
        const quantidade = parseInt(args[0]) || 10;
        if (isNaN(quantidade) || quantidade < 1 || quantidade > 99) {
            return message.reply('⚠️ Use um número entre 1 e 99.');
        }
        try {
            await message.channel.bulkDelete(quantidade + 1, true);
            const aviso = await message.channel.send(`🧹 ${quantidade} mensagens limpas!`);
            setTimeout(() => aviso.delete(), 3000);
        } catch (e) {
            message.reply('❌ Erro ao limpar (mensagens antigas não podem ser deletadas em massa).');
        }
    }

    // 6. KICK
    if (command === 'kick' || command === 'expulsar') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return message.reply('❌ Permissão insuficiente.');
        const membro = message.mentions.members.first();
        if (!membro) return message.reply('⚠️ Mencione um usuário.');
        if (!membro.kickable) return message.reply('❌ Não posso expulsar este usuário.');

        const motivo = args.slice(1).join(' ') || 'Sem motivo';
        await membro.kick(motivo);
        message.reply(`🚪 **${membro.user.tag}** foi expulso.`);
    }

    // 7. BAN
    if (command === 'ban' || command === 'banir') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply('❌ Permissão insuficiente.');
        const membro = message.mentions.members.first();
        if (!membro) return message.reply('⚠️ Mencione um usuário.');
        if (!membro.bannable) return message.reply('❌ Não posso banir este usuário.');

        const motivo = args.slice(1).join(' ') || 'Sem motivo';
        await membro.ban({ reason: motivo });
        message.reply(`🔨 **${membro.user.tag}** foi banido.`);
    }

    // 8. DADO
    if (command === 'dado') {
        const lados = parseInt(args[0]) || 6;
        const resultado = Math.floor(Math.random() * lados) + 1;
        message.reply(`🎲 Dado de ${lados} lados → **${resultado}**`);
    }

    // 9. COINFLIP
    if (command === 'coinflip' || command === 'caraoucoroa') {
        const resultado = Math.random() < 0.5 ? 'Cara' : 'Coroa';
        message.reply(`🪙 Resultado: **${resultado}**`);
    }

    // 10. SAY / FALAR
    if (command === 'say' || command === 'falar') {
        const texto = args.join(' ');
        if (!texto) return message.reply('⚠️ Escreva o texto.');
        message.delete().catch(() => {});
        message.channel.send(texto);
    }

    // 11. ABRAÇO
    if (command === 'abraco' || command === 'hug') {
        const usuario = message.mentions.users.first();
        if (!usuario) return message.reply('⚠️ Mencione alguém para abraçar!');
        message.channel.send(`🤗 <@${message.author.id}> deu um abraço em <@${usuario.id}>!`);
    }

    // 12. AJUDA
    if (command === 'ajuda' || command === 'comandos') {
        const embed = new EmbedBuilder()
            .setColor(0x000000)
            .setTitle('👻 PHANTOM Bot - Comandos')
            .setDescription('Prefixo: `!`')
            .addFields(
                { name: '🔹 Utilitários', value: '`!ping` `!avatar` `!serverinfo` `!userinfo`' },
                { name: '🔹 Moderação', value: '`!clear` `!kick` `!ban`' },
                { name: '🎲 Diversão', value: '`!dado` `!coinflip` `!falar` `!abraco`' }
            );
        message.reply({ embeds: [embed] });
    }
});

client.login(process.env.TOKEN);

// ==================== SITE ====================
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 Site rodando na porta ${PORT}`);
});