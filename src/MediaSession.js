class MediaSessionControl{

    static get obj(){
        return navigator.mediaSession;
    }

    static controlHandler(playPauseHandler, stopHandler){
        navigator.mediaSession.setActionHandler('play', () => {
            playPauseHandler();
        });
    
        navigator.mediaSession.setActionHandler('pause', () => {
            playPauseHandler();
        });
    
        try {
            navigator.mediaSession.setActionHandler('stop', () => {
                stopHandler();
            });
        } catch(error) {
            console.warn('Warning! The "stop" media session action is not supported.');
        }
    }

    static updatePositionState(audio) {
        if ('setPositionState' in navigator.mediaSession) {
            navigator.mediaSession.setPositionState({
                duration: audio.duration,
                playbackRate: audio.playbackRate,
                position: audio.currentTime
            });
        }
    }

    static compareMetadata(metadata){
        return MediaSessionControl.obj.metadata.album == metadata.album ||
        MediaSessionControl.obj.metadata.title == metadata.title ||
        MediaSessionControl.obj.metadata.artist == metadata.artist;
    }

    static updateMetadata(data) {

        let metadata = {
            title: data.title,
            artist: data.artist,
            album: data.album,
        }

        if(data.artwork)
            metadata.artwork = [
                '96x96',
                '128x128',
                '192x192',
                '256x256',
                '384x384',
                '512x512',
            ].map((size) => ({
                src: data.artwork,
                sizes: size,
                type: 'image/png',
            }))
    
        navigator.mediaSession.metadata = new MediaMetadata(metadata);
      
    }

}