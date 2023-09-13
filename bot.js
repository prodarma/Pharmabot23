const Discord = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const spotify = require('spotify-url-info');

const client = new Discord.Client({ intents: ['GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILDS'] });

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith('!play')) return;

    const url = message.content.split(' ')[1];
    let stream;

    if (url.includes('youtube.com')) {
        stream = ytdl(url, { filter: 'audioonly' });
    } else if (url.includes('spotify.com')) {
        const info = await spotify.getData(url);
        stream = ytdl(info.preview_url, { filter: 'audioonly' });
    } else if (url.includes('soundcloud.com')) {
        // handle SoundCloud links
    } else {
        return;
    }

    const channel = message.member.voice.channel;
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(stream);

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
    });

    player.on('error', error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
    });
});

client.login('your-token-goes-here');
