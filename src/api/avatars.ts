import api from './api';
interface AvatarLoader {
    loader: Promise<string>,
    url: string,
}

export const avatars: { [key: string]: AvatarLoader } = {};

export const loadAvatarURL = (steamid: string) => {
    console.log('Loading avatar for:', steamid)
    if(!steamid) return;
    if(avatars[steamid]) {
        console.log('Avatar already loaded:', avatars[steamid])
        return avatars[steamid].url;
    }
    avatars[steamid] = {
        url: '',
        loader: new Promise((resolve) => {
            api.players.getAvatarURLs(steamid).then(result => {
                console.log('Avatar API result:', result)
                avatars[steamid].url = result.custom || result.steam;
                resolve(result.custom || result.custom);
            }).catch(e => {
                console.log('Avatar API fail! Error:', e)
                delete avatars[steamid];
                resolve('');
            });
        })
    }
}
